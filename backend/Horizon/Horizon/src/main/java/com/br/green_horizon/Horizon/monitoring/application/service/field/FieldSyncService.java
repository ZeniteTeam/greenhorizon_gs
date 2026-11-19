package com.br.green_horizon.Horizon.monitoring.application.service.field;

import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import com.br.green_horizon.Horizon.monitoring.application.entities.RainReading;
import com.br.green_horizon.Horizon.monitoring.application.entities.SatelliteReading;
import com.br.green_horizon.Horizon.monitoring.application.entities.StressZone;
import com.br.green_horizon.Horizon.monitoring.application.enums.FieldEventKind;
import com.br.green_horizon.Horizon.monitoring.application.enums.HypothesisKind;
import com.br.green_horizon.Horizon.monitoring.application.enums.ZoneStatus;
import com.br.green_horizon.Horizon.monitoring.application.port.RegionalOutbreaks;
import com.br.green_horizon.Horizon.monitoring.application.service.crop.CropCurves;
import com.br.green_horizon.Horizon.monitoring.application.service.timeline.TimelineService;
import com.br.green_horizon.Horizon.monitoring.application.service.weather.DiseaseRiskRules;
import com.br.green_horizon.Horizon.monitoring.application.service.zone.HypothesisBuilder;
import com.br.green_horizon.Horizon.monitoring.events.MonitoringEvents;
import com.br.green_horizon.Horizon.monitoring.external.api.CalculationsClient;
import com.br.green_horizon.Horizon.monitoring.external.api.CalculationsClient.AnalyzeFieldRequest;
import com.br.green_horizon.Horizon.monitoring.external.api.CalculationsClient.DetectedZone;
import com.br.green_horizon.Horizon.monitoring.external.api.CalculationsClient.Detection;
import com.br.green_horizon.Horizon.monitoring.external.api.OpenMeteoClient;
import com.br.green_horizon.Horizon.monitoring.external.api.OpenMeteoClient.DayWeather;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.IFieldRepository;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.IStressZoneRepository;
import com.br.green_horizon.Horizon.shared.geo.Geo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static com.br.green_horizon.Horizon.shared.format.PtBr.number;

/**
 * Refreshes a field from the satellite: season series, rain, new stress zones and disease risk.
 * Runs on demand (when data is stale) and from {@link ScheduledFieldSync}.
 */
@Service
public class FieldSyncService {

    private static final Logger log = LoggerFactory.getLogger(FieldSyncService.class);
    /** On the first sync, only the latest passes go to the timeline. */
    private static final int PASSES_ON_FIRST_SYNC = 4;
    /** Open-Meteo keeps 92 days of recent weather, used where CHIRPS has not published yet. */
    private static final int WEATHER_PAST_DAYS = 92;
    private static final int FORECAST_DAYS = 7;
    private static final int RAIN_BIN_DAYS = 5;

    private final IFieldRepository fieldRepository;
    private final IStressZoneRepository zoneRepository;
    private final CalculationsClient calculations;
    private final OpenMeteoClient openMeteo;
    private final TimelineService timeline;
    private final HypothesisBuilder hypotheses;
    private final RegionalOutbreaks regionalOutbreaks;
    private final ApplicationEventPublisher events;
    private final Clock clock;
    private final Duration maxAge;

    public FieldSyncService(IFieldRepository fieldRepository, IStressZoneRepository zoneRepository,
                            CalculationsClient calculations, OpenMeteoClient openMeteo, TimelineService timeline,
                            HypothesisBuilder hypotheses, RegionalOutbreaks regionalOutbreaks,
                            ApplicationEventPublisher events, Clock clock,
                            @Value("${monitoring.sync.max-age:PT12H}") Duration maxAge) {
        this.fieldRepository = fieldRepository;
        this.zoneRepository = zoneRepository;
        this.calculations = calculations;
        this.openMeteo = openMeteo;
        this.timeline = timeline;
        this.hypotheses = hypotheses;
        this.regionalOutbreaks = regionalOutbreaks;
        this.events = events;
        this.clock = clock;
        this.maxAge = maxAge;
    }

    /** Syncs the field when its data is older than {@code monitoring.sync.max-age}. */
    public Field ensureFresh(Field field) {
        boolean fresh = field.getSyncedAt() != null && field.getSyncedAt().isAfter(Instant.now(clock).minus(maxAge));
        if (fresh) {
            return field;
        }
        try {
            return sync(field);
        } catch (ResponseStatusException error) {
            if (field.getSyncedAt() == null) {
                throw error;
            }
            log.warn("Sync of field {} failed, serving data from {}: {}", field.getId(), field.getSyncedAt(), error.getReason());
            return field;
        }
    }

    public Field sync(Field field) {
        LocalDate today = LocalDate.now(clock);
        List<StressZone> zones = zoneRepository.findByFieldIdOrderByDetectedAtDesc(field.getId());
        List<double[]> focusZone = zones.stream()
                .filter(z -> z.getStatus() != ZoneStatus.DISMISSED)
                .findFirst()
                .map(StressZone::getPolygon)
                .orElse(null);

        CalculationsClient.FieldAnalysis analysis = calculations.analyzeField(
                new AnalyzeFieldRequest(field.getBoundary(), field.getPlantedAt(), today, focusZone));
        List<DayWeather> weather = weatherOrEmpty(field);
        String previousLastPass = field.getSamples().isEmpty()
                ? null
                : field.getSamples().get(field.getSamples().size() - 1).date();

        field.setSamples(new ArrayList<>(analysis.samples()));
        field.setRain(backfillRain(analysis.rain(), weather));
        field.setSyncedAt(Instant.now(clock));
        Field saved = fieldRepository.save(field);

        recordNewPasses(saved, previousLastPass);
        detectZones(saved, analysis.detection(), zones, today);
        raiseRisks(saved, weather, today);
        return saved;
    }

    private List<DayWeather> weatherOrEmpty(Field field) {
        double[] center = field.centroid();
        try {
            return openMeteo.daily(center[0], center[1], WEATHER_PAST_DAYS, FORECAST_DAYS);
        } catch (ResponseStatusException error) {
            log.warn("Weather unavailable for field {}: {}", field.getId(), error.getReason());
            return List.of();
        }
    }

    /** CHIRPS lags a few weeks; recent 5-day bins are filled from Open-Meteo, or left out. */
    private static List<RainReading> backfillRain(List<RainReading> chirps, List<DayWeather> weather) {
        Map<LocalDate, Double> daily = weather.stream()
                .filter(d -> d.rainMm() != null)
                .collect(Collectors.toMap(DayWeather::date, DayWeather::rainMm));
        List<RainReading> rain = new ArrayList<>();
        for (RainReading bin : chirps) {
            if (bin.mm() != null) {
                rain.add(bin);
                continue;
            }
            LocalDate end = LocalDate.parse(bin.date());
            List<Double> days = end.minusDays(RAIN_BIN_DAYS - 1).datesUntil(end.plusDays(1)).map(daily::get).toList();
            if (days.stream().allMatch(Objects::nonNull)) {
                double mm = days.stream().mapToDouble(Double::doubleValue).sum();
                rain.add(new RainReading(bin.date(), Geo.round(mm, 1), bin.normalMm()));
            }
        }
        return rain;
    }

    private void recordNewPasses(Field field, String previousLastPass) {
        List<SatelliteReading> samples = field.getSamples();
        List<SatelliteReading> fresh = previousLastPass == null
                ? samples.subList(Math.max(0, samples.size() - PASSES_ON_FIRST_SYNC), samples.size())
                : samples.stream().filter(s -> s.date().compareTo(previousLastPass) > 0).toList();

        for (SatelliteReading s : fresh) {
            LocalDate date = LocalDate.parse(s.date());
            String stage = CropCurves.stageAt(field.getCrop(), (int) (date.toEpochDay() - field.getPlantedAt().toEpochDay()));
            if (s.fieldNdvi() == null) {
                timeline.record(field.getId(), date, FieldEventKind.pass, "Passagem sem leitura (nuvens)",
                        "Cena coberta por nuvens. Os dados voltam na próxima passagem.", null);
            } else {
                timeline.record(field.getId(), date, FieldEventKind.pass, "Passagem do Sentinel-2",
                        "NDVI médio " + number(s.fieldNdvi(), 2) + " · " + stage, null);
            }
        }

        fresh.stream()
                .filter(s -> s.fieldNdvi() != null)
                .reduce((first, second) -> second)
                .ifPresent(latest -> {
                    LocalDate lastPass = LocalDate.parse(samples.get(samples.size() - 1).date());
                    events.publishEvent(new MonitoringEvents.FieldSynced(field.getId(), field.getOwnerId(),
                            field.getName(), LocalDate.parse(latest.date()), latest.fieldNdvi(),
                            lastPass.plusDays(CropCurves.REVISIT_DAYS)));
                });
    }

    private void detectZones(Field field, Detection detection, List<StressZone> existing, LocalDate today) {
        if (detection == null || detection.zones() == null || detection.zones().isEmpty()) {
            return;
        }
        LocalDate detectedAt = LocalDate.parse(detection.afterDate());
        if (zoneRepository.existsByFieldIdAndDetectedAt(field.getId(), detectedAt)) {
            return;
        }
        List<StressZone> open = existing.stream().filter(z -> z.getStatus() == ZoneStatus.AWAITING_PHOTO).toList();
        long sequence = zoneRepository.countByFieldId(field.getId());

        for (DetectedZone detected : detection.zones()) {
            boolean alreadyFollowed = open.stream().anyMatch(z -> Geo.contains(z.getPolygon(), detected.scoutPoint()));
            if (alreadyFollowed) {
                continue;
            }
            StressZone zone = new StressZone();
            zone.setId(field.getId() + "-z" + (++sequence));
            zone.setFieldId(field.getId());
            zone.setPolygon(detected.polygon());
            zone.setAreaHa(detected.areaHa());
            zone.setDetectedAt(detectedAt);
            zone.setComparedWith(LocalDate.parse(detection.beforeDate()));
            zone.setVigorDropPct(percentChange(detected.ndviBefore(), detected.ndviAfter()));
            zone.setFieldDropPct(percentChange(detection.fieldNdviBefore(), detection.fieldNdviAfter()));
            zone.setNdmiBefore(detected.ndmiBefore());
            zone.setNdmiAfter(detected.ndmiAfter());
            zone.setScoutLat(detected.scoutPoint()[0]);
            zone.setScoutLng(detected.scoutPoint()[1]);
            zone.setStatus(ZoneStatus.AWAITING_PHOTO);
            zoneRepository.save(zone);

            timeline.record(field.getId(), detectedAt, FieldEventKind.zone, "Zona sob estresse detectada",
                    number(zone.getAreaHa(), 1) + " ha · " + number(Math.abs(zone.getVigorDropPct()), 0)
                            + "% de queda de vigor em " + zone.windowDays() + " dias", null);

            HypothesisKind kind = hypotheses.kind(field, zone);
            events.publishEvent(new MonitoringEvents.ZoneDetected(zone.getId(), field.getId(), field.getOwnerId(),
                    field.getName(), field.getFarm(), field.getMunicipality(), field.getCrop().name(),
                    zone.getAreaHa(), zone.getVigorDropPct(), zone.scoutPoint(), detectedAt,
                    kind == HypothesisKind.PEST_OR_DISEASE));
        }
    }

    private void raiseRisks(Field field, List<DayWeather> weather, LocalDate today) {
        List<DayWeather> forecast = weather.stream().filter(d -> !d.date().isBefore(today)).limit(FORECAST_DAYS).toList();
        var nearby = regionalOutbreaks.confirmedNear(field.centroid(), HypothesisBuilder.NEARBY_OUTBREAK_KM, null);
        DiseaseRiskRules.evaluate(field.getCrop(), forecast, nearby).stream()
                .filter(risk -> "high".equals(risk.level()))
                .forEach(risk -> events.publishEvent(new MonitoringEvents.DiseaseRiskRaised(field.getId(),
                        field.getOwnerId(), field.getName(), risk.disease(), risk.reasons())));
    }

    private static double percentChange(Double before, Double after) {
        if (before == null || after == null || before == 0) {
            return 0;
        }
        return (after - before) / before * 100;
    }
}
