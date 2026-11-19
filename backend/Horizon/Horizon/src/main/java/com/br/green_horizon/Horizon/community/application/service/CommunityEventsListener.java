package com.br.green_horizon.Horizon.community.application.service;

import com.br.green_horizon.Horizon.community.application.entities.CommunityAlert;
import com.br.green_horizon.Horizon.community.application.entities.Outbreak;
import com.br.green_horizon.Horizon.community.infrastructure.repository.ICommunityAlertRepository;
import com.br.green_horizon.Horizon.community.infrastructure.repository.IOutbreakRepository;
import com.br.green_horizon.Horizon.monitoring.application.facade.MonitoringFacade;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldExtrasResponses.FieldLocation;
import com.br.green_horizon.Horizon.monitoring.events.MonitoringEvents;
import com.br.green_horizon.Horizon.notification.application.facade.NotificationFacade;
import com.br.green_horizon.Horizon.shared.geo.Geo;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

import static com.br.green_horizon.Horizon.shared.format.PtBr.number;

/**
 * Keeps the regional outbreak map in sync with the zones farmers follow, and warns neighbors
 * within {@link #ALERT_RADIUS_KM} when a disease is confirmed by photo.
 */
@Component
public class CommunityEventsListener {

    public static final double ALERT_RADIUS_KM = 15;
    private static final String UNKNOWN_CAUSE = "Causa a confirmar";

    private final IOutbreakRepository outbreakRepository;
    private final ICommunityAlertRepository alertRepository;
    private final MonitoringFacade monitoring;
    private final NotificationFacade notifications;
    private final Clock clock;

    public CommunityEventsListener(IOutbreakRepository outbreakRepository, ICommunityAlertRepository alertRepository,
                                   MonitoringFacade monitoring, NotificationFacade notifications, Clock clock) {
        this.outbreakRepository = outbreakRepository;
        this.alertRepository = alertRepository;
        this.monitoring = monitoring;
        this.notifications = notifications;
        this.clock = clock;
    }

    @EventListener
    public void on(MonitoringEvents.ZoneDetected event) {
        alert(event.ownerId(), "watch",
                number(event.areaHa(), 1) + " ha sob estresse no " + event.fieldName(),
                "Vá até o ponto indicado e fotografe uma folha para confirmar o que é.");

        if (event.likelyPestOrDisease()) {
            Outbreak outbreak = fromZone(event.zoneId(), event.fieldId(), event.ownerId(), event.fieldName(),
                    event.farm(), event.municipality(), event.crop(), event.position());
            outbreak.setDisease(UNKNOWN_CAUSE);
            outbreak.setStatus(Outbreak.SUSPECTED);
            outbreak.setReportedAt(event.detectedAt());
            outbreak.setAreaHa(event.areaHa());
            outbreak.setVigorDropPct(event.vigorDropPct());
            outbreakRepository.save(outbreak);
        }
    }

    @EventListener
    public void on(MonitoringEvents.ZoneConfirmed event) {
        Outbreak outbreak = outbreakRepository.findById(event.zoneId())
                .orElseGet(() -> fromZone(event.zoneId(), event.fieldId(), event.ownerId(), event.fieldName(),
                        event.farm(), event.municipality(), event.crop(), event.position()));
        outbreak.setDisease(event.diagnosis());
        outbreak.setStatus(Outbreak.CONFIRMED);
        outbreak.setReportedAt(event.confirmedAt());

        // One alert per neighboring producer, at the distance of their nearest field.
        Map<Long, Double> neighbors = new LinkedHashMap<>();
        for (FieldLocation field : monitoring.fieldsNear(event.position(), ALERT_RADIUS_KM)) {
            if (!Objects.equals(field.ownerId(), event.ownerId())) {
                neighbors.merge(field.ownerId(), Geo.distanceKm(event.position(), field.centroid()), Math::min);
            }
        }
        neighbors.forEach((userId, km) -> {
            String title = event.diagnosis() + " confirmada a " + number(km, 0) + " km de você";
            String body = "Monitore sua lavoura nos próximos 7 dias, olhando a parte de baixo das folhas.";
            alert(userId, "act", title, body);
            notifications.notify(userId, "outbreak", title, body, null, "community");
        });
        outbreak.setAlertedProducers(neighbors.size());
        outbreakRepository.save(outbreak);

        String reach = neighbors.isEmpty()
                ? "Nenhum outro produtor cadastrado num raio de 15 km por enquanto."
                : neighbors.size() + " produtores num raio de 15 km foram avisados para monitorar as lavouras.";
        alert(event.ownerId(), "act", "Você confirmou " + event.diagnosis().toLowerCase() + " no " + event.fieldName(), reach);
        notifications.notify(event.ownerId(), "diagnosis", "Vizinhos avisados", reach, event.fieldId(), "community");
    }

    @EventListener
    public void on(MonitoringEvents.ZoneDismissed event) {
        outbreakRepository.findById(event.zoneId()).ifPresent(outbreakRepository::delete);
    }

    @EventListener
    public void on(MonitoringEvents.VisitScheduled event) {
        if (event.zoneId() == null) {
            return;
        }
        outbreakRepository.findById(event.zoneId()).ifPresent(outbreak -> {
            outbreak.setVisitScheduled(true);
            outbreakRepository.save(outbreak);
        });
    }

    private Outbreak fromZone(String zoneId, String fieldId, Long ownerId, String fieldName, String farm,
                              String municipality, String crop, double[] position) {
        Outbreak outbreak = new Outbreak();
        outbreak.setId(zoneId);
        outbreak.setSourceZoneId(zoneId);
        outbreak.setFieldId(fieldId);
        outbreak.setOwnerId(ownerId);
        outbreak.setProducer(farm);
        outbreak.setFieldName(fieldName + " · " + crop);
        outbreak.setMunicipality(municipality);
        outbreak.setLocality(fieldName + " · " + farm);
        outbreak.setLat(position[0]);
        outbreak.setLng(position[1]);
        return outbreak;
    }

    private void alert(Long userId, String severity, String title, String body) {
        CommunityAlert alert = new CommunityAlert();
        alert.setUserId(userId);
        alert.setSeverity(severity);
        alert.setTitle(title);
        alert.setBody(body);
        alert.setCreatedAt(LocalDateTime.now(clock));
        alertRepository.save(alert);
    }
}
