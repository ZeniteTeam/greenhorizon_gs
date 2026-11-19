package com.br.green_horizon.Horizon.monitoring.infrastructure.repository;

import com.br.green_horizon.Horizon.monitoring.application.entities.Technician;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ITechnicianRepository extends JpaRepository<Technician, Long> {
    Optional<Technician> findFirstByMunicipality(String municipality);

    Optional<Technician> findFirstByOrderByIdAsc();
}
