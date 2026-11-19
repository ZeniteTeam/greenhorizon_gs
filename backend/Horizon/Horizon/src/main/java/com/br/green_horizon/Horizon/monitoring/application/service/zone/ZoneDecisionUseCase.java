package com.br.green_horizon.Horizon.monitoring.application.service.zone;

import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import com.br.green_horizon.Horizon.monitoring.application.entities.StressZone;
import com.br.green_horizon.Horizon.monitoring.application.enums.FieldEventKind;
import com.br.green_horizon.Horizon.monitoring.application.enums.ZoneStatus;
import com.br.green_horizon.Horizon.monitoring.application.service.field.FieldAccess;
import com.br.green_horizon.Horizon.monitoring.application.service.timeline.TimelineService;
import com.br.green_horizon.Horizon.monitoring.events.MonitoringEvents;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.ILeafPhotoRepository;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.IStressZoneRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;

/**
 * The farmer's decision about a zone. A confirmation labels the latest photo as ground truth and
 * triggers the community alerts; a dismissal labels it as a false alarm.
 */
@Service
public class ZoneDecisionUseCase {

    private static final String FALSE_ALARM = "Alarme falso";
    private static final String AUTHOR = "Produtor";

    private final FieldAccess access;
    private final IStressZoneRepository zoneRepository;
    private final ILeafPhotoRepository photoRepository;
    private final TimelineService timeline;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    public ZoneDecisionUseCase(FieldAccess access, IStressZoneRepository zoneRepository,
                               ILeafPhotoRepository photoRepository, TimelineService timeline,
                               ApplicationEventPublisher events, Clock clock) {
        this.access = access;
        this.zoneRepository = zoneRepository;
        this.photoRepository = photoRepository;
        this.timeline = timeline;
        this.events = events;
        this.clock = clock;
    }

    @Transactional
    public void confirm(String zoneId, Long userId, String diagnosis) {
        FieldAccess.ZoneInField target = access.zone(zoneId, userId);
        StressZone zone = target.zone();
        Field field = target.field();
        LocalDate today = LocalDate.now(clock);
        String label = diagnosis.trim();

        zone.setStatus(ZoneStatus.CONFIRMED);
        zone.setDiagnosis(label);
        zoneRepository.save(zone);
        labelLatestPhoto(zoneId, label);

        timeline.record(field.getId(), today, FieldEventKind.diagnosis, label + " confirmada por foto",
                "Vizinhos num raio de 15 km foram avisados.", AUTHOR);
        events.publishEvent(new MonitoringEvents.ZoneConfirmed(zone.getId(), field.getId(), field.getOwnerId(),
                field.getName(), field.getFarm(), field.getMunicipality(), field.getCrop().name(), label,
                zone.scoutPoint(), today));
    }

    @Transactional
    public void dismiss(String zoneId, Long userId) {
        FieldAccess.ZoneInField target = access.zone(zoneId, userId);
        StressZone zone = target.zone();
        Field field = target.field();

        zone.setStatus(ZoneStatus.DISMISSED);
        zoneRepository.save(zone);
        labelLatestPhoto(zoneId, FALSE_ALARM);

        timeline.record(field.getId(), LocalDate.now(clock), FieldEventKind.dismissal,
                "Alerta marcado como alarme falso", null, AUTHOR);
        events.publishEvent(new MonitoringEvents.ZoneDismissed(zone.getId(), field.getId(), field.getOwnerId()));
    }

    private void labelLatestPhoto(String zoneId, String label) {
        photoRepository.findFirstByZoneIdOrderByCreatedAtDesc(zoneId).ifPresent(photo -> {
            photo.setConfirmedLabel(label);
            photoRepository.save(photo);
        });
    }
}
