package com.br.green_horizon.Horizon.monitoring.data.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonUnwrapped;

import java.util.List;

/** Field payloads. Shapes mirror frontend/src/types/monitoring.ts; points are {@code [lat, lng]}. */
public final class FieldResponses {

    private FieldResponses() {
    }

    public record FieldSummary(
            String id,
            String name,
            String farm,
            String municipality,
            String crop,
            double areaHa,
            String plantedAt,
            int daysAfterPlanting,
            String stage,
            String health,
            double ndviNow,
            double[] expectedNow,
            List<Double> trend,
            String lastPass,
            String nextPass,
            int openZones,
            double[] centroid
    ) {
    }

    public record FieldDetail(
            @JsonUnwrapped FieldSummary summary,
            List<double[]> boundary,
            double[] entrance,
            String today,
            int todayDap,
            int seasonLengthDays,
            List<SatelliteSample> samples,
            List<ExpectedPoint> expected,
            List<RainSample> rain,
            List<StressZone> zones
    ) {
    }

    public record SatelliteSample(String date, int dap, String stage, Double fieldNdvi, Double zoneNdvi,
                                  Double fieldNdmi, Double zoneNdmi, double cloudMasked) {
    }

    public record ExpectedPoint(int dap, double low, double high) {
    }

    public record RainSample(String date, int dap, double mm, double normalMm) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record StressZone(
            String id,
            List<double[]> polygon,
            double areaHa,
            String detectedAt,
            double vigorDropPct,
            int windowDays,
            double fieldDropPct,
            double[] scoutPoint,
            String scoutHint,
            String status,
            Hypothesis hypothesis,
            String diagnosis
    ) {
    }

    public record Hypothesis(String kind, String label, List<Evidence> evidence) {
    }

    public record Evidence(String id, String label, String value, String reading, String tone) {
    }

    public record Tile(String url) {
    }
}
