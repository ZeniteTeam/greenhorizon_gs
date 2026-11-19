package com.br.green_horizon.Horizon.monitoring.application.service.visit;

import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import com.br.green_horizon.Horizon.monitoring.application.entities.Technician;
import com.br.green_horizon.Horizon.monitoring.application.entities.TechnicianVisit;
import com.br.green_horizon.Horizon.monitoring.application.enums.FieldEventKind;
import com.br.green_horizon.Horizon.monitoring.application.service.field.FieldAccess;
import com.br.green_horizon.Horizon.monitoring.application.service.timeline.TimelineService;
import com.br.green_horizon.Horizon.monitoring.data.request.MonitoringRequests.RequestVisit;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldExtrasResponses;
import com.br.green_horizon.Horizon.monitoring.events.MonitoringEvents;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.ITechnicianRepository;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.ITechnicianVisitRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

import static com.br.green_horizon.Horizon.shared.format.PtBr.dayMonth;

/** Technician visits. The technician is picked from those registered for the field's municipality. */
@Service
public class VisitService {

    private static final String SCHEDULED = "scheduled";

    private final ITechnicianVisitRepository visitRepository;
    private final ITechnicianRepository technicianRepository;
    private final FieldAccess access;
    private final TimelineService timeline;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    public VisitService(ITechnicianVisitRepository visitRepository, ITechnicianRepository technicianRepository,
                        FieldAccess access, TimelineService timeline, ApplicationEventPublisher events, Clock clock) {
        this.visitRepository = visitRepository;
        this.technicianRepository = technicianRepository;
        this.access = access;
        this.timeline = timeline;
        this.events = events;
        this.clock = clock;
    }

    public List<FieldExtrasResponses.TechnicianVisit> list(Field field) {
        return visitRepository.findByFieldIdOrderByDateAsc(field.getId()).stream().map(VisitService::toResponse).toList();
    }

    public FieldExtrasResponses.TechnicianVisit request(Long userId, RequestVisit request) {
        Field field = access.field(request.fieldId(), userId);
        LocalDate today = LocalDate.now(clock);
        if (request.date().isBefore(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escolha uma data a partir de hoje.");
        }
        if (request.zoneId() != null && !access.zone(request.zoneId(), userId).field().getId().equals(field.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A zona não pertence a este talhão.");
        }
        Technician technician = technicianRepository.findFirstByMunicipality(field.getMunicipality())
                .or(technicianRepository::findFirstByOrderByIdAsc)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "Nenhum técnico cadastrado para atender este talhão."));

        TechnicianVisit visit = new TechnicianVisit();
        visit.setFieldId(field.getId());
        visit.setZoneId(request.zoneId());
        visit.setDate(request.date());
        visit.setPeriod(request.period());
        visit.setTechnician(technician.getName());
        visit.setOrganization(technician.getOrganization());
        visit.setPhone(technician.getPhone());
        visit.setNote(request.note());
        visit.setStatus(SCHEDULED);
        visit = visitRepository.save(visit);

        timeline.record(field.getId(), today, FieldEventKind.visit, "Visita técnica agendada",
                dayMonth(visit.getDate()) + " · " + visit.getPeriod().label() + " · " + visit.getTechnician(), null);
        events.publishEvent(new MonitoringEvents.VisitScheduled(field.getId(), visit.getZoneId(), field.getOwnerId(),
                visit.getTechnician(), visit.getDate(), visit.getPeriod().label()));
        return toResponse(visit);
    }

    private static FieldExtrasResponses.TechnicianVisit toResponse(TechnicianVisit v) {
        return new FieldExtrasResponses.TechnicianVisit(String.valueOf(v.getId()), v.getFieldId(), v.getZoneId(),
                v.getDate().toString(), v.getPeriod().name(), v.getTechnician(), v.getOrganization(), v.getPhone(),
                v.getNote(), v.getStatus());
    }
}
