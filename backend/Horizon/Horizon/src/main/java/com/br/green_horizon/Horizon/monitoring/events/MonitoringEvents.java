package com.br.green_horizon.Horizon.monitoring.events;

import java.time.LocalDate;
import java.util.List;

/** Spring application events published by the monitoring module. */
public final class MonitoringEvents {

    private MonitoringEvents() {
    }

    /** New satellite passes were processed for a field. */
    public record FieldSynced(String fieldId, Long ownerId, String fieldName, LocalDate lastPass,
                              Double ndvi, LocalDate nextPass) {
    }

    /** A new stress zone was found. {@code likelyPestOrDisease} comes from the hypothesis rules. */
    public record ZoneDetected(String zoneId, String fieldId, Long ownerId, String fieldName, String farm,
                               String municipality, String crop, double areaHa, double vigorDropPct,
                               double[] position, LocalDate detectedAt, boolean likelyPestOrDisease) {
    }

    /** The farmer confirmed what the zone is, after a leaf photo. */
    public record ZoneConfirmed(String zoneId, String fieldId, Long ownerId, String fieldName, String farm,
                                String municipality, String crop, String diagnosis, double[] position,
                                LocalDate confirmedAt) {
    }

    /** The farmer marked the zone as a false alarm. */
    public record ZoneDismissed(String zoneId, String fieldId, Long ownerId) {
    }

    public record VisitScheduled(String fieldId, String zoneId, Long ownerId, String technician, LocalDate date,
                                 String periodLabel) {
    }

    /** The coming week favors a disease in this field. */
    public record DiseaseRiskRaised(String fieldId, Long ownerId, String fieldName, String disease,
                                    List<String> reasons) {
    }
}
