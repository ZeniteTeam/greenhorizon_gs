package com.br.green_horizon.Horizon.monitoring.data.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/** Weather, timeline, visit and diagnosis payloads. Shapes mirror frontend/src/types/monitoring.ts. */
public final class FieldExtrasResponses {

    private FieldExtrasResponses() {
    }

    public record FieldWeather(List<ForecastDay> forecast, List<DiseaseRisk> risks, double rain30dMm,
                               double normal30dMm) {
    }

    public record ForecastDay(String date, int minC, int maxC, int rainMm, int rainChance, int humidity,
                              int leafWetnessHours) {
    }

    public record DiseaseRisk(String disease, String level, List<String> reasons) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record FieldEvent(String id, String date, String kind, String title, String description, String author) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record TechnicianVisit(String id, String fieldId, String zoneId, String date, String period,
                                  String technician, String organization, String phone, String note,
                                  String status) {
    }

    public record LeafDiagnosis(String label, String scientificName, double confidence,
                                List<ClassScore> alternatives, String model, PlainExplanation explanation) {
    }

    public record ClassScore(String label, double confidence) {
    }

    public record PlainExplanation(String summary, List<String> whatToDo, String caution) {
    }

    /** Lightweight field info shared with other modules (community). */
    public record FieldLocation(String fieldId, Long ownerId, String name, String farm, String municipality,
                                String crop, double areaHa, double[] centroid) {
    }
}
