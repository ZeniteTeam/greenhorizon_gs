package com.br.green_horizon.Horizon.community.infrastructure.adapter;

import com.br.green_horizon.Horizon.community.application.entities.Outbreak;
import com.br.green_horizon.Horizon.community.infrastructure.repository.IOutbreakRepository;
import com.br.green_horizon.Horizon.monitoring.application.port.RegionalOutbreaks;
import com.br.green_horizon.Horizon.shared.geo.Geo;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/** Gives the monitoring module read access to confirmed outbreaks. */
@Component
public class RegionalOutbreaksAdapter implements RegionalOutbreaks {

    private final IOutbreakRepository repository;

    public RegionalOutbreaksAdapter(IOutbreakRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<NearbyOutbreak> confirmedNear(double[] point, double radiusKm, String excludeZoneId) {
        return repository.findByStatus(Outbreak.CONFIRMED).stream()
                .filter(o -> excludeZoneId == null || !Objects.equals(o.getSourceZoneId(), excludeZoneId))
                .map(o -> new NearbyOutbreak(o.getDisease(), Geo.distanceKm(point, o.position()), o.getLocality()))
                .filter(o -> o.distanceKm() <= radiusKm)
                .sorted(Comparator.comparingDouble(NearbyOutbreak::distanceKm))
                .toList();
    }
}
