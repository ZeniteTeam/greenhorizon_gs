package com.br.green_horizon.Horizon.monitoring.infrastructure.repository;

import com.br.green_horizon.Horizon.monitoring.application.entities.FieldEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IFieldEventRepository extends JpaRepository<FieldEvent, Long> {
    List<FieldEvent> findByFieldId(String fieldId);
}
