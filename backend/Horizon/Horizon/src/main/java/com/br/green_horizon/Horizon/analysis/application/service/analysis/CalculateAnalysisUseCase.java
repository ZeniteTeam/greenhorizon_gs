package com.br.green_horizon.Horizon.analysis.application.service.analysis;

import com.br.green_horizon.Horizon.analysis.application.entities.Analise;
import com.br.green_horizon.Horizon.analysis.application.enums.TipoPlantio;
import com.br.green_horizon.Horizon.analysis.data.request.CreateAnalysisRequest;
import com.br.green_horizon.Horizon.analysis.data.response.CreateAnalysisResponse;
import com.br.green_horizon.Horizon.analysis.external.api.CalculationApiClient;
import com.br.green_horizon.Horizon.analysis.infrastructure.mapper.AnalysisMapper;
import com.br.green_horizon.Horizon.analysis.infrastructure.repository.IAnaliseRepository;
import org.springframework.stereotype.Service;

@Service
public class CalculateAnalysisUseCase {
    private final IAnaliseRepository analiseRepository;

    public CalculateAnalysisUseCase(IAnaliseRepository analiseRepository) {
        this.analiseRepository = analiseRepository;
    }
    public CreateAnalysisResponse CreateAnalysis(CreateAnalysisRequest request) throws Exception {
        var calculationApiClient = new CalculationApiClient();
        try {
            var apiResponse = calculationApiClient.calculate(request);

            var analysis =  AnalysisMapper.MapApiToAnalysis(apiResponse, new Analise());
            analysis.setTipo(TipoPlantio.valueOf(request.tipo()));

            analiseRepository.save(analysis);

            return AnalysisMapper.MapAnalysisToCreateResponse(analysis, new CreateAnalysisResponse());

        } catch (Exception e) {
          throw new Exception("Erro durante chamada de api", e);
        }
    }

}
