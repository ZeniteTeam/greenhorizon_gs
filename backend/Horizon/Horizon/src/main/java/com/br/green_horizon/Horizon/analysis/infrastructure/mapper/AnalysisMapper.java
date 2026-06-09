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


    public static Analise MapApiToAnalysis(Map<String, Object> data, Analise analise) {
        try {

            analise.setNdviMedia(((Number) data.get("ndvi")).doubleValue());
            analise.setTileUrl((String) data.get("tile_url"));
            analise.setStatus(Status.valueOf((String) data.get("status")));
            analise.setDate(new Date());
            analise.setAreaTotalPorHectar(((Number) data.get("area_total_ha")).doubleValue());
            analise.setCoberturaVegetalPercentual(((Number)data.get("cobertura_vegetal_percentual")).doubleValue());

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
        response.setDate(analysis.getDate());
        response.setTemporada(analysis.getTemporada());
        response.setSafra(analysis.getSafra());
        response.setCoberturaVegetal(analysis.getCoberturaVegetalPercentual());
        response.setAreaTotalPercentual(analysis.getAreaTotalPorHectar());
        response.setTemporada(analysis.getTemporada());
        response.setTileUrl(analysis.getTileUrl());

        return response;
    }
}