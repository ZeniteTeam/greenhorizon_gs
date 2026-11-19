package com.br.green_horizon.Horizon.monitoring.application.service.field;

import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import com.br.green_horizon.Horizon.monitoring.infrastructure.repository.IFieldRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Re-analyzes every field on a schedule, the local stand-in for Cloud Scheduler. */
@Component
public class ScheduledFieldSync {

    private static final Logger log = LoggerFactory.getLogger(ScheduledFieldSync.class);

    private final IFieldRepository fieldRepository;
    private final FieldSyncService syncService;

    public ScheduledFieldSync(IFieldRepository fieldRepository, FieldSyncService syncService) {
        this.fieldRepository = fieldRepository;
        this.syncService = syncService;
    }

    @Scheduled(cron = "${monitoring.sync.cron}", zone = "America/Sao_Paulo")
    public void syncAll() {
        for (Field field : fieldRepository.findAll()) {
            try {
                syncService.sync(field);
            } catch (RuntimeException error) {
                log.warn("Scheduled sync of field {} failed: {}", field.getId(), error.getMessage());
            }
        }
    }
}
