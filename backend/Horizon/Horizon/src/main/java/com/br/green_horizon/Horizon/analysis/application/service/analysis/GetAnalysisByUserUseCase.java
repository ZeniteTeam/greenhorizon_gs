package com.br.green_horizon.Horizon.analysis.application.service.analysis;

import com.br.green_horizon.Horizon.analysis.application.entities.Analise;
import com.br.green_horizon.Horizon.analysis.application.entities.Interpretacao;
import com.br.green_horizon.Horizon.analysis.application.entities.Recomendacao;
import com.br.green_horizon.Horizon.analysis.data.response.GetHistoricoListResponse;
import com.br.green_horizon.Horizon.analysis.data.response.InterpretacaoDto;
import com.br.green_horizon.Horizon.analysis.data.response.RecomendacaoDto;
import com.br.green_horizon.Horizon.analysis.infrastructure.repository.IAnaliseRepository;
import com.br.green_horizon.Horizon.analysis.infrastructure.repository.IInterpretacaoRepository;
import com.br.green_horizon.Horizon.analysis.infrastructure.repository.IRecomendacaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GetAnalysisByUserUseCase {
    private final IAnaliseRepository analiseRepository;
    private final IRecomendacaoRepository recomendacaoRepository;
    private final IInterpretacaoRepository interpretacaoRepository;

    public GetAnalysisByUserUseCase(IAnaliseRepository analiseRepository, IRecomendacaoRepository recomendacaoRepository, IInterpretacaoRepository interpretacaoRepository) {
        this.analiseRepository = analiseRepository;
        this.recomendacaoRepository = recomendacaoRepository;
        this.interpretacaoRepository = interpretacaoRepository;
    }

    public List<GetHistoricoListResponse> GetByUser(long id) throws Exception {
        try {
            List<Analise> analiseList = analiseRepository.findByUsuarioId(id);
            if (analiseList.isEmpty()){
                throw new Exception("Não encontrado analises com esse ID");
            }

            List<GetHistoricoListResponse> mappedAnalise = analiseList.stream().map(GetHistoricoListResponse::new).toList();

            for (int i = 0; i < analiseList.size(); i++) {
                List<Interpretacao> interpretacao = interpretacaoRepository.findByAnalise(analiseList.get(i));
                List<Recomendacao> recomendacao = recomendacaoRepository.findByAnalise(analiseList.get(i));
                mappedAnalise.get(i).setInterpretacao(interpretacao.stream().map(InterpretacaoDto::new).toList());
                mappedAnalise.get(i).setRecomendacao(recomendacao.stream().map(RecomendacaoDto::new).toList());
            }

            return mappedAnalise;
        }catch (Exception e){
            throw new Exception("Tome");
        }
    }


}
