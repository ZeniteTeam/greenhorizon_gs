package com.br.green_horizon.Horizon.analysis.data.request;

import java.util.List;

public record CreateAnalysisRequest(
        String email,
        String tipo,
        List<CreatePoint> points
) {
    public record CreatePoint(
            Double latitude,
            Double longitude
    ) {}
}

