package com.br.green_horizon.Horizon.monitoring.infrastructure.repository;

import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IFieldRepository extends JpaRepository<Field, String> {
    List<Field> findByOwnerIdOrderByNameAsc(Long ownerId);

    Optional<Field> findByIdAndOwnerId(String id, Long ownerId);
}
