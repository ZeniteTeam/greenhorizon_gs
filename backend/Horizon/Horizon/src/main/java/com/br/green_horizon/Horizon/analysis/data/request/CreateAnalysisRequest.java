package com.br.green_horizon.Horizon.analysis.data.request;

import java.util.List;

public class CreateAnalysisRequest {
    List<CreatePoint> points;

    public class CreatePoint {
        Double latitude;
        Double longitude;
    }

}

