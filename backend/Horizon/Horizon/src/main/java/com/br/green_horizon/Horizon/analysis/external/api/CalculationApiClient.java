package com.br.green_horizon.Horizon.analysis.external.api;

import com.br.green_horizon.Horizon.analysis.data.request.CreateAnalysisRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/** Calls the Python calculation service for the one-off area analysis. */
@Service
public class CalculationApiClient {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String baseUrl;

    public CalculationApiClient(@Value("${calculation.api.url}") String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public ResponseEntity<String> calculate(CreateAnalysisRequest request) {
        return restTemplate.postForEntity(baseUrl + "/calculate", request, String.class);
    }
}
