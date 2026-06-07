package com.br.green_horizon.Horizon.analysis.external.api;

import com.br.green_horizon.Horizon.analysis.data.request.CreateAnalysisRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CalculationApiClient {
    private final RestTemplate restTemplate;

    public CalculationApiClient() {
        this.restTemplate = new RestTemplate();
    }

    //Python local fast api
    public Object calculate(CreateAnalysisRequest request) {
        String url = "http://localhost:8000/calculate";
        return restTemplate.postForEntity(url, request, String.class);
    }
}
