package com.br.green_horizon.Horizon.community.data.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/** Mirrors CommunityOverview in frontend/src/types/monitoring.ts. */
public record CommunityOverviewResponse(String asOf, double[] center, double radiusKm, List<Outbreak> outbreaks,
                                        List<Alert> alerts, List<VisitPriority> visits, Stats stats) {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Outbreak(String id, String disease, String status, double[] position, String reportedAt,
                           double distanceKm, String municipality, Boolean isMine) {
    }

    public record Alert(String id, String severity, String title, String body, String createdAt) {
    }

    public record VisitPriority(String id, String producer, String fieldName, String municipality, String reason,
                                int score, double distanceKm) {
    }

    public record Stats(int confirmed, int suspected, int producersAlerted, double areaAtRiskHa) {
    }
}
