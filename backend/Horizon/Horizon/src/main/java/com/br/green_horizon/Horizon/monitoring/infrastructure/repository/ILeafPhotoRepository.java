package com.br.green_horizon.Horizon.monitoring.infrastructure.repository;

import com.br.green_horizon.Horizon.monitoring.application.entities.LeafPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ILeafPhotoRepository extends JpaRepository<LeafPhoto, Long> {
    Optional<LeafPhoto> findFirstByZoneIdOrderByCreatedAtDesc(String zoneId);
}
