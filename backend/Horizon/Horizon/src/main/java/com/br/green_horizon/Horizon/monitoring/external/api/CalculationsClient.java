package com.br.green_horizon.Horizon.monitoring.external.api;

import com.br.green_horizon.Horizon.monitoring.application.entities.RainReading;
import com.br.green_horizon.Horizon.monitoring.application.entities.SatelliteReading;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.function.Supplier;

/** Client for the internal Python calculation service (Earth Engine + leaf diagnosis). */
@Component
public class CalculationsClient {

    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    private final RestClient rest;

    public CalculationsClient(@Value("${calculation.api.url}") String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofMinutes(3));
        this.rest = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }

    public FieldAnalysis analyzeField(AnalyzeFieldRequest request) {
        return call(() -> rest.post().uri("/fields/analyze").body(request).retrieve().body(FieldAnalysis.class));
    }

    public String tileUrl(TileRequest request) {
        TileResponse response = call(() -> rest.post().uri("/fields/tiles").body(request).retrieve().body(TileResponse.class));
        return response.url();
    }

    public LeafDiagnosisResult diagnoseLeaf(byte[] photo, String filename, String contentType, DiagnosisContext context) {
        HttpHeaders photoHeaders = new HttpHeaders();
        photoHeaders.setContentType(MediaType.parseMediaType(contentType));
        ByteArrayResource photoResource = new ByteArrayResource(photo) {
            @Override
            public String getFilename() {
                return filename;
            }
        };

        LinkedMultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("photo", new HttpEntity<>(photoResource, photoHeaders));
        parts.add("context", MAPPER.writeValueAsString(context));

        return call(() -> rest.post()
                .uri("/leaf/diagnose")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(parts)
                .retrieve()
                .body(LeafDiagnosisResult.class));
    }

    /** Turns failures of the calculation service into HTTP errors the frontend can show. */
    private static <T> T call(Supplier<T> request) {
        try {
            return request.get();
        } catch (RestClientResponseException error) {
            HttpStatus status = HttpStatus.resolve(error.getStatusCode().value());
            throw new ResponseStatusException(status == null ? HttpStatus.BAD_GATEWAY : status, detail(error), error);
        } catch (ResourceAccessException error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Serviço de cálculos indisponível. Verifique se ele está rodando.", error);
        }
    }

    private static String detail(RestClientResponseException error) {
        try {
            JsonNode body = MAPPER.readTree(error.getResponseBodyAsString());
            JsonNode detail = body.get("detail");
            if (detail != null && detail.isString()) {
                return detail.asString();
            }
        } catch (RuntimeException ignored) {
            // Body was not JSON; fall back to the status text.
        }
        return "Serviço de cálculos respondeu com erro " + error.getStatusCode().value() + ".";
    }

    public record AnalyzeFieldRequest(List<double[]> boundary, LocalDate plantedAt, LocalDate until, List<double[]> focusZone) {
    }

    public record FieldAnalysis(List<SatelliteReading> samples, List<RainReading> rain, Detection detection) {
    }

    public record Detection(String beforeDate, String afterDate, Double fieldNdviBefore, Double fieldNdviAfter,
                            List<DetectedZone> zones) {
    }

    public record DetectedZone(List<double[]> polygon, double areaHa, Double ndviBefore, Double ndviAfter,
                               Double ndmiBefore, Double ndmiAfter, double[] scoutPoint) {
    }

    public record TileRequest(List<double[]> boundary, LocalDate date, String layer, LocalDate previousDate) {
    }

    private record TileResponse(String url) {
    }

    public record DiagnosisContext(String crop, String stage, String municipality, Double vigorDropPct,
                                   Integer windowDays, Double rainVsNormalPct, List<String> nearbyOutbreaks) {
    }

    public record ClassScore(String label, double confidence) {
    }

    public record PlainExplanation(String summary, List<String> whatToDo, String caution) {
    }

    public record LeafDiagnosisResult(String label, String scientificName, double confidence,
                                      List<ClassScore> alternatives, PlainExplanation explanation,
                                      String model, String photoSha256) {
    }
}
