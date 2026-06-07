package com.br.green_horizon.Horizon.analysis.application.facade;

import com.br.green_horizon.Horizon.analysis.application.entities.Analise;
import com.br.green_horizon.Horizon.analysis.application.service.analysis.CalculateAnalysisUseCase;
import com.br.green_horizon.Horizon.analysis.application.service.analysis.GetAllAnalysisUseCase;
import com.br.green_horizon.Horizon.analysis.application.service.analysis.GetAnalysisByUserUseCase;
import com.br.green_horizon.Horizon.analysis.data.request.CreateAnalysisRequest;
import com.br.green_horizon.Horizon.analysis.data.response.CreateAnalysisResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnaliseFacade {

    private final GetAllAnalysisUseCase getAllAnalysisUseCase;
    private final GetAnalysisByUserUseCase getAnalysisByUserUseCase;
    private final CalculateAnalysisUseCase calculateAnalysisUseCase;

    public AnaliseFacade(GetAllAnalysisUseCase getAllAnalysisUseCase, GetAnalysisByUserUseCase getAnalysisByUserUseCase, CalculateAnalysisUseCase calculateAnalysisUseCase) {
        this.getAllAnalysisUseCase = getAllAnalysisUseCase;
        this.getAnalysisByUserUseCase = getAnalysisByUserUseCase;
        this.calculateAnalysisUseCase = calculateAnalysisUseCase;
    }

    public List<Analise> GetAll(){
        return getAllAnalysisUseCase.GetAll();
    }

    public List<Analise> GetById(long id) throws Exception {
        return getAnalysisByUserUseCase.GetByUser(id);
    }

    public CreateAnalysisResponse CreateAnalysis(CreateAnalysisRequest request) throws Exception {
        return calculateAnalysisUseCase.CreateAnalysis(request);
    }
}
