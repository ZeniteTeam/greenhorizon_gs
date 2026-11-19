package com.br.green_horizon.Horizon.monitoring.application.service.field;

import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldResponses.FieldDetail;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldResponses.FieldSummary;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldResponses.Tile;
import com.br.green_horizon.Horizon.monitoring.external.api.CalculationsClient;
import com.br.green_horizon.Horizon.monitoring.external.api.CalculationsClient.TileRequest;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.IFieldRepository;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.IStressZoneRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
public class FieldQueryUseCase {

    private static final Set<String> LAYERS = Set.of("ndvi", "ndmi", "change");

    private final IFieldRepository fieldRepository;
    private final IStressZoneRepository zoneRepository;
    private final FieldAccess access;
    private final FieldSyncService syncService;
    private final FieldViewAssembler assembler;
    private final CalculationsClient calculations;

    public FieldQueryUseCase(IFieldRepository fieldRepository, IStressZoneRepository zoneRepository, FieldAccess access,
                             FieldSyncService syncService, FieldViewAssembler assembler, CalculationsClient calculations) {
        this.fieldRepository = fieldRepository;
        this.zoneRepository = zoneRepository;
        this.access = access;
        this.syncService = syncService;
        this.assembler = assembler;
        this.calculations = calculations;
    }

    public List<FieldSummary> list(Long userId) {
        return fieldRepository.findByOwnerIdOrderByNameAsc(userId).stream()
                .map(syncService::ensureFresh)
                .map(field -> assembler.summary(field, zoneRepository.findByFieldIdOrderByDetectedAtDesc(field.getId())))
                .toList();
    }

    public FieldDetail detail(String fieldId, Long userId) {
        Field field = syncService.ensureFresh(access.field(fieldId, userId));
        return assembler.detail(field, zoneRepository.findByFieldIdOrderByDetectedAtDesc(fieldId));
    }

    public FieldDetail sync(String fieldId, Long userId) {
        Field field = syncService.sync(access.field(fieldId, userId));
        return assembler.detail(field, zoneRepository.findByFieldIdOrderByDetectedAtDesc(fieldId));
    }

    public Tile tile(String fieldId, Long userId, LocalDate date, String layer, LocalDate previousDate) {
        if (!LAYERS.contains(layer)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Camada inválida: " + layer);
        }
        Field field = access.field(fieldId, userId);
        return new Tile(calculations.tileUrl(new TileRequest(field.getBoundary(), date, layer, previousDate)));
    }
}
