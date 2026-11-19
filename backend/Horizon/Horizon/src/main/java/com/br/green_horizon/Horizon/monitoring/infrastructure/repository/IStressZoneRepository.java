package com.br.green_horizon.Horizon.monitoring.infrastructure.repository;

import com.br.green_horizon.Horizon.monitoring.application.entities.StressZone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface IStressZoneRepository extends JpaRepository<StressZone, String> {
    List<StressZone> findByFieldIdOrderByDetectedAtDesc(String fieldId);

    boolean existsByFieldIdAndDetectedAt(String fieldId, LocalDate detectedAt);

    long countByFieldId(String fieldId);
}
