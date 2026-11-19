package com.br.green_horizon.Horizon.monitoring.application.facade;

import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import com.br.green_horizon.Horizon.monitoring.application.service.field.FieldAccess;
import com.br.green_horizon.Horizon.monitoring.application.service.field.FieldQueryUseCase;
import com.br.green_horizon.Horizon.monitoring.application.service.timeline.TimelineService;
import com.br.green_horizon.Horizon.monitoring.application.service.visit.VisitService;
import com.br.green_horizon.Horizon.monitoring.application.service.weather.FieldWeatherUseCase;
import com.br.green_horizon.Horizon.monitoring.application.service.zone.DiagnoseLeafUseCase;
import com.br.green_horizon.Horizon.monitoring.application.service.zone.ZoneDecisionUseCase;
import com.br.green_horizon.Horizon.monitoring.data.request.MonitoringRequests;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldExtrasResponses;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldExtrasResponses.FieldLocation;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldResponses;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.IFieldRepository;
import com.br.green_horizon.Horizon.shared.geo.Geo;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

/** Entry point of the monitoring module, for its controllers and for other modules. */
@Service
public class MonitoringFacade {

    private final FieldQueryUseCase fieldQuery;
    private final FieldWeatherUseCase weather;
    private final TimelineService timeline;
    private final VisitService visits;
    private final DiagnoseLeafUseCase diagnoseLeaf;
    private final ZoneDecisionUseCase zoneDecision;
    private final FieldAccess access;
    private final IFieldRepository fieldRepository;
    private final Clock clock;

    public MonitoringFacade(FieldQueryUseCase fieldQuery, FieldWeatherUseCase weather, TimelineService timeline,
                            VisitService visits, DiagnoseLeafUseCase diagnoseLeaf, ZoneDecisionUseCase zoneDecision,
                            FieldAccess access, IFieldRepository fieldRepository, Clock clock) {
        this.fieldQuery = fieldQuery;
        this.weather = weather;
        this.timeline = timeline;
        this.visits = visits;
        this.diagnoseLeaf = diagnoseLeaf;
        this.zoneDecision = zoneDecision;
        this.access = access;
        this.fieldRepository = fieldRepository;
        this.clock = clock;
    }

    public List<FieldResponses.FieldSummary> fields(Long userId) {
        return fieldQuery.list(userId);
    }

    public FieldResponses.FieldDetail field(String fieldId, Long userId) {
        return fieldQuery.detail(fieldId, userId);
    }

    public FieldResponses.FieldDetail syncField(String fieldId, Long userId) {
        return fieldQuery.sync(fieldId, userId);
    }

    public FieldResponses.Tile tile(String fieldId, Long userId, LocalDate date, String layer, LocalDate previousDate) {
        return fieldQuery.tile(fieldId, userId, date, layer, previousDate);
    }

    public FieldExtrasResponses.FieldWeather weather(String fieldId, Long userId) {
        return weather.weather(access.field(fieldId, userId));
    }

    public List<FieldExtrasResponses.FieldEvent> events(String fieldId, Long userId) {
        return timeline.list(access.field(fieldId, userId));
    }

    public FieldExtrasResponses.FieldEvent addNote(String fieldId, Long userId, MonitoringRequests.AddNote request) {
        return timeline.addNote(access.field(fieldId, userId), request.text(), request.author(), LocalDate.now(clock));
    }

    public List<FieldExtrasResponses.TechnicianVisit> visits(String fieldId, Long userId) {
        return visits.list(access.field(fieldId, userId));
    }

    public FieldExtrasResponses.TechnicianVisit requestVisit(Long userId, MonitoringRequests.RequestVisit request) {
        return visits.request(userId, request);
    }

    public FieldExtrasResponses.LeafDiagnosis diagnoseLeaf(String zoneId, Long userId, MultipartFile photo) {
        return diagnoseLeaf.diagnose(zoneId, userId, photo);
    }

    public void confirmZone(String zoneId, Long userId, String diagnosis) {
        zoneDecision.confirm(zoneId, userId, diagnosis);
    }

    public void dismissZone(String zoneId, Long userId) {
        zoneDecision.dismiss(zoneId, userId);
    }

    // ---- read access for other modules

    public List<FieldLocation> fieldsOf(Long userId) {
        return fieldRepository.findByOwnerIdOrderByNameAsc(userId).stream().map(MonitoringFacade::toLocation).toList();
    }

    /** Every registered field whose centre lies within {@code radiusKm} of the point, nearest first. */
    public List<FieldLocation> fieldsNear(double[] point, double radiusKm) {
        return fieldRepository.findAll().stream()
                .map(MonitoringFacade::toLocation)
                .filter(f -> Geo.distanceKm(point, f.centroid()) <= radiusKm)
                .sorted(Comparator.comparingDouble(f -> Geo.distanceKm(point, f.centroid())))
                .toList();
    }

    private static FieldLocation toLocation(Field field) {
        return new FieldLocation(field.getId(), field.getOwnerId(), field.getName(), field.getFarm(),
                field.getMunicipality(), field.getCrop().name(), field.areaHa(), field.centroid());
    }
}
