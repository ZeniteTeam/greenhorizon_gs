package com.br.green_horizon.Horizon.notification.events;

import com.br.green_horizon.Horizon.monitoring.events.MonitoringEvents;
import com.br.green_horizon.Horizon.notification.application.facade.NotificationFacade;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import static com.br.green_horizon.Horizon.shared.format.PtBr.dayMonth;
import static com.br.green_horizon.Horizon.shared.format.PtBr.number;

/** Turns monitoring events into notifications for the field's owner. */
@Component
public class MonitoringNotifications {

    private final NotificationFacade notifications;

    public MonitoringNotifications(NotificationFacade notifications) {
        this.notifications = notifications;
    }

    @EventListener
    public void on(MonitoringEvents.FieldSynced event) {
        notifications.notify(event.ownerId(), "pass",
                "Nova passagem do satélite processada",
                event.fieldName() + ": NDVI médio " + number(event.ndvi(), 2)
                        + ". Próxima passagem por volta de " + dayMonth(event.nextPass()) + ".",
                event.fieldId(), "field");
    }

    @EventListener
    public void on(MonitoringEvents.ZoneDetected event) {
        notifications.notify(event.ownerId(), "zone",
                event.fieldName() + ": " + number(event.areaHa(), 1) + " ha perdendo vigor",
                "Vá até o ponto marcado e fotografe uma folha.",
                event.fieldId(), "field");
    }

    @EventListener
    public void on(MonitoringEvents.VisitScheduled event) {
        notifications.notify(event.ownerId(), "visit",
                "Visita técnica confirmada",
                event.technician() + " vai ao talhão em " + dayMonth(event.date()) + ", de " + event.periodLabel() + ".",
                event.fieldId(), "field");
    }

    @EventListener
    public void on(MonitoringEvents.DiseaseRiskRaised event) {
        notifications.notifyOncePerDay(event.ownerId(), "risk",
                event.fieldName() + ": semana favorável à " + event.disease().toLowerCase(),
                String.join(". ", event.reasons()) + ".",
                event.fieldId(), "field");
    }
}
