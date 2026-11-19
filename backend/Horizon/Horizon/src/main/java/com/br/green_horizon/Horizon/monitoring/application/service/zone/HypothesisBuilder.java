package com.br.green_horizon.Horizon.monitoring.application.service.zone;

import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import com.br.green_horizon.Horizon.monitoring.application.entities.RainReading;
import com.br.green_horizon.Horizon.monitoring.application.entities.StressZone;
import com.br.green_horizon.Horizon.monitoring.application.enums.HypothesisKind;
import com.br.green_horizon.Horizon.monitoring.application.port.RegionalOutbreaks;
import com.br.green_horizon.Horizon.monitoring.application.port.RegionalOutbreaks.NearbyOutbreak;
import com.br.green_horizon.Horizon.monitoring.application.service.crop.CropCurves;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldResponses.Evidence;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldResponses.Hypothesis;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import static com.br.green_horizon.Horizon.shared.format.PtBr.number;
import static com.br.green_horizon.Horizon.shared.format.PtBr.signed;

/**
 * Explains a stress zone by crossing the satellite signal with rain, leaf moisture, crop stage and
 * regional outbreaks. Rules are deliberately simple and readable; they suggest, the photo confirms.
 */
@Component
public class HypothesisBuilder {

    public static final double NEARBY_OUTBREAK_KM = 15;
    private static final int RAIN_WINDOW_DAYS = 30;
    /** Rain below 60% of normal makes water shortage plausible. */
    private static final double LOW_RAIN_PCT = 60;
    /** An NDMI fall of 0.05 or more means the leaves lost water. */
    private static final double WATER_NDMI_DROP = 0.05;
    /** A zone covering 60% of the field or more is a field-wide change. */
    private static final double BROAD_ZONE_SHARE = 0.6;

    private final RegionalOutbreaks regionalOutbreaks;

    public HypothesisBuilder(RegionalOutbreaks regionalOutbreaks) {
        this.regionalOutbreaks = regionalOutbreaks;
    }

    public HypothesisKind kind(Field field, StressZone zone) {
        return kindOf(signals(field, zone));
    }

    public Hypothesis build(Field field, StressZone zone) {
        Signals s = signals(field, zone);
        HypothesisKind kind = kindOf(s);
        List<Evidence> evidence = new ArrayList<>();

        evidence.add(new Evidence("zone-ndvi", "Vigor da zona (NDVI)",
                signed(zone.getVigorDropPct(), 0) + "% em " + zone.windowDays() + " dias",
                s.broad()
                        ? "Queda em " + number(zone.getAreaHa(), 1) + " ha, boa parte do talhão."
                        : "Queda concentrada em " + number(zone.getAreaHa(), 1) + " ha do talhão.",
                "signal"));

        evidence.add(new Evidence("field-mean", "Média do talhão inteiro",
                signed(zone.getFieldDropPct(), 1) + "%",
                s.broad()
                        ? "A média do talhão inteiro também caiu."
                        : "Olhando só a média, o problema passaria despercebido.",
                "signal"));

        if (s.rainPct() != null) {
            boolean dry = s.rainPct() < LOW_RAIN_PCT;
            evidence.add(new Evidence("rain", "Chuva, últimos 30 dias (CHIRPS)",
                    number(s.rainPct(), 0) + "% da média",
                    dry ? "Choveu bem abaixo da média: falta de água é possível."
                            : "Choveu normalmente: falta de água é improvável.",
                    dry ? "supports" : "rules-out"));
        }

        if (zone.getNdmiBefore() != null && zone.getNdmiAfter() != null) {
            boolean drying = s.ndmiDrop() >= WATER_NDMI_DROP;
            evidence.add(new Evidence("ndmi", "Umidade da folha (NDMI)",
                    number(zone.getNdmiBefore(), 2) + " → " + number(zone.getNdmiAfter(), 2),
                    drying ? "A folha perdeu umidade: sinal de estresse hídrico."
                            : "Praticamente estável: sem sinal de estresse hídrico.",
                    drying ? "supports" : "rules-out"));
        }

        evidence.add(new Evidence("stage", "Fase da cultura",
                CropCurves.stageAt(field.getCrop(), s.dap()),
                s.senescing()
                        ? "A cultura está entrando na maturação: parte da perda de vigor é natural."
                        : "Nesta fase a " + field.getCrop().name().toLowerCase()
                        + " ainda deveria estar ganhando ou mantendo vigor: não é maturação natural.",
                s.senescing() ? "supports" : "rules-out"));

        if (!s.nearby().isEmpty()) {
            NearbyOutbreak nearest = s.nearby().get(0);
            evidence.add(new Evidence("community", "Focos na região",
                    nearest.disease() + " confirmada a " + number(nearest.distanceKm(), 0) + " km",
                    "Os esporos viajam com o vento: risco real de chegada.",
                    "supports"));
        }

        return new Hypothesis(kind.wire(), kind.label(), evidence);
    }

    public List<NearbyOutbreak> nearbyOutbreaks(StressZone zone) {
        return regionalOutbreaks.confirmedNear(zone.scoutPoint(), NEARBY_OUTBREAK_KM, zone.getId());
    }

    /** Rain in the 30 days up to {@code until} as a percentage of the normal, or null without data. */
    public static Double rainVsNormalPct(Field field, LocalDate until) {
        LocalDate from = until.minusDays(RAIN_WINDOW_DAYS);
        double mm = 0;
        double normal = 0;
        for (RainReading r : field.getRain()) {
            LocalDate date = LocalDate.parse(r.date());
            if (r.mm() != null && date.isAfter(from) && !date.isAfter(until)) {
                mm += r.mm();
                normal += r.normalMm();
            }
        }
        return normal > 0 ? mm / normal * 100 : null;
    }

    private Signals signals(Field field, StressZone zone) {
        int dap = (int) ChronoUnit.DAYS.between(field.getPlantedAt(), zone.getDetectedAt());
        Double ndmiDrop = zone.getNdmiBefore() != null && zone.getNdmiAfter() != null
                ? zone.getNdmiBefore() - zone.getNdmiAfter()
                : null;
        double share = field.areaHa() > 0 ? zone.getAreaHa() / field.areaHa() : 0;
        return new Signals(
                dap,
                CropCurves.isSenescing(field.getCrop(), dap),
                share >= BROAD_ZONE_SHARE,
                rainVsNormalPct(field, zone.getDetectedAt()),
                ndmiDrop,
                nearbyOutbreaks(zone));
    }

    private static HypothesisKind kindOf(Signals s) {
        if (s.senescing() && s.broad()) {
            return HypothesisKind.NATURAL_CYCLE;
        }
        boolean dry = s.rainPct() != null && s.rainPct() < LOW_RAIN_PCT;
        boolean drying = s.ndmiDrop() != null && s.ndmiDrop() >= WATER_NDMI_DROP;
        return dry || drying ? HypothesisKind.WATER_STRESS : HypothesisKind.PEST_OR_DISEASE;
    }

    private record Signals(int dap, boolean senescing, boolean broad, Double rainPct, Double ndmiDrop,
                           List<NearbyOutbreak> nearby) {
    }
}
