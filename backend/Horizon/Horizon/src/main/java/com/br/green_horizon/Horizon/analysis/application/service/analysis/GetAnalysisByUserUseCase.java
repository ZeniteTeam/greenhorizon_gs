package com.br.green_horizon.Horizon.analysis.application.service.analysis;

import com.br.green_horizon.Horizon.analysis.application.entities.Analise;
import com.br.green_horizon.Horizon.analysis.infrastructure.repository.IAnaliseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GetAnalysisByUserUseCase {
    private final IAnaliseRepository analiseRepository;

    public GetAnalysisByUserUseCase(IAnaliseRepository analiseRepository) {
        this.analiseRepository = analiseRepository;
    }

    public List<Analise> GetByUser(long id) throws Exception {
        try {
            return analiseRepository.findByUsuarioId(id);
        }catch (Exception e){
            throw new Exception("Tome");
        }
    }


}
