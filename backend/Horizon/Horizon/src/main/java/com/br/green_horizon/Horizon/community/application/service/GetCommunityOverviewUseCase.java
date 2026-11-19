package com.br.green_horizon.Horizon.community.application.service;

import com.br.green_horizon.Horizon.community.application.entities.Outbreak;
import com.br.green_horizon.Horizon.community.data.response.CommunityOverviewResponse;
import com.br.green_horizon.Horizon.community.infrastructure.repository.ICommunityAlertRepository;
import com.br.green_horizon.Horizon.community.infrastructure.repository.IOutbreakRepository;
import com.br.green_horizon.Horizon.monitoring.application.facade.MonitoringFacade;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldExtrasResponses.FieldLocation;
import com.br.green_horizon.Horizon.shared.geo.Geo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.LocalDate;
import java.util.*;

import static com.br.green_horizon.Horizon.shared.format.PtBr.number;

/** Regional picture around the user's fields: outbreak map, alerts, visit priorities and totals. */
@Service
public class GetCommunityOverviewUseCase {

    /** Fields this close to a confirmed outbreak count as area at risk. */
    private static final double AT_RISK_KM = 5;
    private static final int MAX_VISITS = 8;

    private final IOutbreakRepository outbreakRepository;
    private final ICommunityAlertRepository alertRepository;
    private final MonitoringFacade monitoring;
    private final Clock clock;

    public GetCommunityOverviewUseCase(IOutbreakRepository outbreakRepository, ICommunityAlertRepository alertRepository,
                                       MonitoringFacade monitoring, Clock clock) {
        this.outbreakRepository = outbreakRepository;
        this.alertRepository = alertRepository;
        this.monitoring = monitoring;
        this.clock = clock;
    }

    public CommunityOverviewResponse overview(Long userId, double radiusKm) {
        List<FieldLocation> myFields = monitoring.fieldsOf(userId);
        if (myFields.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cadastre um talhão para ver a sua região.");
        }
        double[] center = Geo.centroid(myFields.stream().map(FieldLocation::centroid).toList());

        List<Outbreak> nearby = outbreakRepository.findAll().stream()
                .filter(o -> Geo.distanceKm(center, o.position()) <= radiusKm)
                .sorted(Comparator.comparingDouble(o -> Geo.distanceKm(center, o.position())))
                .toList();
        List<Outbreak> confirmed = nearby.stream().filter(Outbreak::isConfirmed).toList();

        return new CommunityOverviewResponse(
                LocalDate.now(clock).toString(),
                center,
                radiusKm,
                nearby.stream().map(o -> toOutbreak(o, center, userId)).toList(),
                alertRepository.findTop10ByUserIdOrderByCreatedAtDescIdDesc(userId).stream()
                        .map(a -> new CommunityOverviewResponse.Alert(String.valueOf(a.getId()), a.getSeverity(),
                                a.getTitle(), a.getBody(), a.getCreatedAt().toString()))
                        .toList(),
                visitPriorities(nearby, confirmed, center),
                new CommunityOverviewResponse.Stats(
                        confirmed.size(),
                        nearby.size() - confirmed.size(),
                        nearby.stream().mapToInt(Outbreak::getAlertedProducers).sum(),
                        Geo.round(areaAtRisk(confirmed), 0)));
    }

    private static CommunityOverviewResponse.Outbreak toOutbreak(Outbreak o, double[] center, Long userId) {
        return new CommunityOverviewResponse.Outbreak(o.getId(), o.getDisease(), o.getStatus(), o.position(),
                o.getReportedAt().toString(), Geo.round(Geo.distanceKm(center, o.position()), 1), o.getLocality(),
                Objects.equals(o.getOwnerId(), userId) ? Boolean.TRUE : null);
    }

    /**
     * Where a technician is most needed: photo-confirmed outbreaks first, then suspected zones,
     * weighted by vigor loss and by a confirmed outbreak close by. Already scheduled visits are left out.
     */
    private static List<CommunityOverviewResponse.VisitPriority> visitPriorities(List<Outbreak> nearby,
                                                                                 List<Outbreak> confirmed,
                                                                                 double[] center) {
        List<CommunityOverviewResponse.VisitPriority> visits = new ArrayList<>();
        for (Outbreak o : nearby) {
            if (o.getProducer() == null || o.isVisitScheduled()) {
                continue;
            }
            double drop = o.getVigorDropPct() == null ? 0 : Math.abs(o.getVigorDropPct());
            Optional<Double> nearestConfirmedKm = confirmed.stream()
                    .filter(c -> c != o)
                    .map(c -> Geo.distanceKm(o.position(), c.position()))
                    .min(Double::compare);

            int score;
            String reason;
            if (o.isConfirmed()) {
                score = 85 + (int) Math.min(15, drop / 2);
                reason = o.getDisease() + " confirmada por foto do produtor, aguarda visita técnica";
            } else {
                boolean closeToConfirmed = nearestConfirmedKm.map(km -> km <= 10).orElse(false);
                score = 50 + (int) Math.min(25, drop) + (closeToConfirmed ? 15 : 0);
                reason = "Zona" + (o.getAreaHa() == null ? "" : " de " + number(o.getAreaHa(), 1) + " ha")
                        + " sob estresse" + (drop > 0 ? " (" + number(drop, 0) + "% de vigor)" : "")
                        + ", sem confirmação"
                        + (closeToConfirmed ? ", a " + number(nearestConfirmedKm.get(), 0) + " km de foco confirmado" : "");
            }
            visits.add(new CommunityOverviewResponse.VisitPriority(o.getId(), o.getProducer(), o.getFieldName(),
                    o.getMunicipality(), reason, Math.min(100, score), Geo.round(Geo.distanceKm(center, o.position()), 1)));
        }
        visits.sort(Comparator.comparingInt(CommunityOverviewResponse.VisitPriority::score).reversed());
        return visits.subList(0, Math.min(MAX_VISITS, visits.size()));
    }

    private double areaAtRisk(List<Outbreak> confirmed) {
        Map<String, Double> fields = new HashMap<>();
        for (Outbreak o : confirmed) {
            monitoring.fieldsNear(o.position(), AT_RISK_KM).forEach(f -> fields.put(f.fieldId(), f.areaHa()));
        }
        return fields.values().stream().mapToDouble(Double::doubleValue).sum();
    }
}
