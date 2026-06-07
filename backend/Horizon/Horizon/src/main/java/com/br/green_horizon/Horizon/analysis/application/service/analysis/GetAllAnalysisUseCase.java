package com.br.green_horizon.Horizon.analysis.application.service.analysis;

import com.br.green_horizon.Horizon.analysis.application.entities.Analise;
import com.br.green_horizon.Horizon.analysis.infrastructure.repository.IAnaliseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GetAllAnalysisUseCase {
    private final IAnaliseRepository analiseRepository;

    public GetAllAnalysisUseCase(IAnaliseRepository analiseRepository) {
        this.analiseRepository = analiseRepository;
    }

    public List<Analise> GetAll(){
        return analiseRepository.findAll();
    }


}
