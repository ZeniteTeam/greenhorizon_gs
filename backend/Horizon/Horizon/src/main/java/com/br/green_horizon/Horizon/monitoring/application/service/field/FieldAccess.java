package com.br.green_horizon.Horizon.monitoring.application.service.field;

import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import com.br.green_horizon.Horizon.monitoring.application.entities.StressZone;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.IFieldRepository;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.IStressZoneRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Loads fields and zones, making sure they belong to the user asking. */
@Service
public class FieldAccess {

    private final IFieldRepository fieldRepository;
    private final IStressZoneRepository zoneRepository;

    public FieldAccess(IFieldRepository fieldRepository, IStressZoneRepository zoneRepository) {
        this.fieldRepository = fieldRepository;
        this.zoneRepository = zoneRepository;
    }

    public Field field(String fieldId, Long userId) {
        return fieldRepository.findByIdAndOwnerId(fieldId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Talhão não encontrado: " + fieldId));
    }

    public ZoneInField zone(String zoneId, Long userId) {
        StressZone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zona não encontrada: " + zoneId));
        return new ZoneInField(zone, field(zone.getFieldId(), userId));
    }

    public record ZoneInField(StressZone zone, Field field) {
    }
}
