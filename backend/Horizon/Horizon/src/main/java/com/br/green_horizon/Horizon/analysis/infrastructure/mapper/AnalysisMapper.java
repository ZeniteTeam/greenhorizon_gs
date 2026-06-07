package com.br.green_horizon.Horizon.analysis.infrastructure.mapper;

import com.br.green_horizon.Horizon.analysis.application.entities.Analise;
import com.br.green_horizon.Horizon.analysis.application.enums.Clima;
import com.br.green_horizon.Horizon.analysis.application.enums.Status;
import com.br.green_horizon.Horizon.analysis.application.enums.TipoPlantio;
import com.br.green_horizon.Horizon.analysis.data.response.CreateAnalysisResponse;
import org.springframework.http.ResponseEntity;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.Date;
import java.util.Map;

public class AnalysisMapper {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static Analise MapApiToAnalysis(Object apiResponse, Analise analise) {
        try {
            ResponseEntity<?> response = (ResponseEntity<?>) apiResponse;
            String json = response.getBody() != null ? response.getBody().toString() : null;
            Map<String, Object> data = objectMapper.readValue(json, new TypeReference<>() {});

            analise.setNdviMedia(((Number) data.get("ndvi_media")).doubleValue());
            analise.setTipo(TipoPlantio.valueOf((String) data.get("tipo")));
            analise.setClima(Clima.valueOf((String) data.get("clima")));
            analise.setStatus(Status.valueOf((String) data.get("status")));
            analise.setRecomendacao((String) data.get("recomendacao"));
            analise.setDate(new Date());
            analise.setTemporada((String) data.get("temporada"));
            analise.setSafra((String) data.get("safra"));

            return analise;
        } catch (Exception e) {
            throw new RuntimeException("Failed to map API response to Analise", e);
        }
    }

    public static CreateAnalysisResponse MapAnalysisToCreateResponse(Analise analysis, CreateAnalysisResponse response) {
        response.setId(analysis.getId());
        response.setNdviMedia(analysis.getNdviMedia());
        response.setTipo(analysis.getTipo());
        response.setClima(analysis.getClima());
        response.setStatus(analysis.getStatus());
        response.setRecomendacao(analysis.getRecomendacao());
        response.setDate(analysis.getDate());
        response.setTemporada(analysis.getTemporada());
        response.setSafra(analysis.getSafra());
        return response;
    }
}
