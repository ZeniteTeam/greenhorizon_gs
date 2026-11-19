package com.br.green_horizon.Horizon.monitoring.infrastructure.repository;

import com.br.green_horizon.Horizon.monitoring.application.entities.TechnicianVisit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ITechnicianVisitRepository extends JpaRepository<TechnicianVisit, Long> {
    List<TechnicianVisit> findByFieldIdOrderByDateAsc(String fieldId);
}
