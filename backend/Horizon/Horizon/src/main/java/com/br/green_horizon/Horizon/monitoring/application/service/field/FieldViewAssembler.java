package com.br.green_horizon.Horizon.monitoring.application.service.field;

import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import com.br.green_horizon.Horizon.monitoring.application.entities.SatelliteReading;
import com.br.green_horizon.Horizon.monitoring.application.entities.StressZone;
import com.br.green_horizon.Horizon.monitoring.application.enums.ZoneStatus;
import com.br.green_horizon.Horizon.monitoring.application.service.crop.CropCurves;
import com.br.green_horizon.Horizon.monitoring.application.service.zone.HypothesisBuilder;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldResponses;
import com.br.green_horizon.Horizon.shared.geo.Geo;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/** Turns stored fields and zones into the payloads the frontend expects. */
@Component
public class FieldViewAssembler {

    private static final int TREND_LENGTH = 10;

    private final HypothesisBuilder hypotheses;
    private final Clock clock;

    public FieldViewAssembler(HypothesisBuilder hypotheses, Clock clock) {
        this.hypotheses = hypotheses;
        this.clock = clock;
    }

    /** Zones being followed come first (latest first), dismissed ones last. */
    public static List<StressZone> ordered(List<StressZone> zones) {
        return zones.stream()
                .sorted(Comparator.comparing((StressZone z) -> z.getStatus() == ZoneStatus.DISMISSED)
                        .thenComparing(StressZone::getDetectedAt, Comparator.reverseOrder()))
                .toList();
    }

    public FieldResponses.FieldSummary summary(Field field, List<StressZone> zones) {
        LocalDate today = LocalDate.now(clock);
        List<SatelliteReading> samples = field.getSamples();
        SatelliteReading last = samples.isEmpty() ? null : samples.get(samples.size() - 1);
        int lastDap = last == null ? dap(field, today) : dap(field, LocalDate.parse(last.date()));

        List<Double> readable = samples.stream().map(SatelliteReading::fieldNdvi).filter(Objects::nonNull).toList();
        Double ndviNow = readable.isEmpty() ? null : readable.get(readable.size() - 1);
        CropCurves.ExpectedPoint expected = CropCurves.expectedAt(field.getCrop(), lastDap);
        LocalDate lastPass = last == null ? field.getPlantedAt() : LocalDate.parse(last.date());

        String health;
        if (zones.stream().anyMatch(z -> z.getStatus() != ZoneStatus.DISMISSED)) {
            health = "stress";
        } else if (ndviNow != null && ndviNow < expected.low()) {
            health = "attention";
        } else {
            health = "on-track";
        }

        return new FieldResponses.FieldSummary(
                field.getId(),
                field.getName(),
                field.getFarm(),
                field.getMunicipality(),
                field.getCrop().name(),
                Geo.round(field.areaHa(), 1),
                field.getPlantedAt().toString(),
                dap(field, today),
                CropCurves.stageAt(field.getCrop(), lastDap),
                health,
                ndviNow == null ? 0 : ndviNow,
                new double[]{expected.low(), expected.high()},
                readable.subList(Math.max(0, readable.size() - TREND_LENGTH), readable.size()),
                lastPass.toString(),
                lastPass.plusDays(CropCurves.REVISIT_DAYS).toString(),
                (int) zones.stream().filter(z -> z.getStatus() == ZoneStatus.AWAITING_PHOTO).count(),
                field.centroid());
    }

    public FieldResponses.FieldDetail detail(Field field, List<StressZone> zones) {
        LocalDate today = LocalDate.now(clock);
        List<StressZone> orderedZones = ordered(zones);

        List<FieldResponses.SatelliteSample> samples = field.getSamples().stream()
                .map(s -> {
                    int dap = dap(field, LocalDate.parse(s.date()));
                    return new FieldResponses.SatelliteSample(s.date(), dap, CropCurves.stageAt(field.getCrop(), dap), s.fieldNdvi(),
                            s.zoneNdvi(), s.fieldNdmi(), s.zoneNdmi(), s.cloudMasked());
                })
                .toList();

        List<FieldResponses.ExpectedPoint> expected = CropCurves.expected(field.getCrop()).stream()
                .map(p -> new FieldResponses.ExpectedPoint(p.dap(), p.low(), p.high()))
                .toList();

        List<FieldResponses.RainSample> rain = field.getRain().stream()
                .filter(r -> r.mm() != null)
                .map(r -> new FieldResponses.RainSample(r.date(), dap(field, LocalDate.parse(r.date())), r.mm(), r.normalMm()))
                .toList();

        return new FieldResponses.FieldDetail(
                summary(field, zones),
                field.getBoundary(),
                field.entrance(),
                today.toString(),
                dap(field, today),
                CropCurves.of(field.getCrop()).seasonLengthDays(),
                samples,
                expected,
                rain,
                orderedZones.stream().map(z -> zone(field, z)).toList());
    }

    private FieldResponses.StressZone zone(Field field, StressZone z) {
        return new FieldResponses.StressZone(
                z.getId(),
                z.getPolygon(),
                Geo.round(z.getAreaHa(), 1),
                z.getDetectedAt().toString(),
                Geo.round(z.getVigorDropPct(), 1),
                z.windowDays(),
                Geo.round(z.getFieldDropPct(), 1),
                z.scoutPoint(),
                scoutHint(field, z),
                z.getStatus().wire(),
                hypotheses.build(field, z),
                z.getDiagnosis());
    }

    private static String scoutHint(Field field, StressZone zone) {
        if (field.getEntranceLat() == null || field.getEntranceLng() == null) {
            return "Ponto marcado no mapa";
        }
        long meters = Math.round(Geo.distanceKm(field.entrance(), zone.scoutPoint()) * 100) * 10;
        return meters + " m " + Geo.directionPhrase(field.entrance(), zone.scoutPoint()) + " da porteira";
    }

    private static int dap(Field field, LocalDate date) {
        return (int) ChronoUnit.DAYS.between(field.getPlantedAt(), date);
    }
}
