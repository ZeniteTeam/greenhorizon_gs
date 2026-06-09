package com.br.green_horizon.Horizon.analysis.application.service.analysis;

import com.br.green_horizon.Horizon.analysis.application.entities.Analise;
import com.br.green_horizon.Horizon.analysis.application.entities.Interpretacao;
import com.br.green_horizon.Horizon.analysis.application.entities.Recomendacao;
import com.br.green_horizon.Horizon.analysis.application.enums.TipoPlantio;
import com.br.green_horizon.Horizon.analysis.data.request.CreateAnalysisRequest;
import com.br.green_horizon.Horizon.analysis.data.response.CreateAnalysisResponse;
import com.br.green_horizon.Horizon.analysis.data.response.InterpretacaoDto;
import com.br.green_horizon.Horizon.analysis.data.response.RecomendacaoDto;
import com.br.green_horizon.Horizon.analysis.external.api.CalculationApiClient;
import com.br.green_horizon.Horizon.analysis.infrastructure.mapper.AnalysisMapper;
import com.br.green_horizon.Horizon.analysis.infrastructure.repository.IAnaliseRepository;
import com.br.green_horizon.Horizon.analysis.infrastructure.repository.IInterpretacaoRepository;
import com.br.green_horizon.Horizon.analysis.infrastructure.repository.IRecomendacaoRepository;
import com.br.green_horizon.Horizon.user.infrastructure.repository.IUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CalculateAnalysisUseCase {
    private final IAnaliseRepository analiseRepository;
    private final IInterpretacaoRepository interpretacaoRepository;
    private final IRecomendacaoRepository recomendacaoRepository;
    private final IUserRepository userRepository;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public CalculateAnalysisUseCase(IAnaliseRepository analiseRepository, IInterpretacaoRepository interpretacaoRepository, IRecomendacaoRepository recomendacaoRepository, IUserRepository userRepository) {
        this.analiseRepository = analiseRepository;
        this.interpretacaoRepository = interpretacaoRepository;
        this.recomendacaoRepository = recomendacaoRepository;
        this.userRepository = userRepository;
    }
    public CreateAnalysisResponse CreateAnalysis(CreateAnalysisRequest request) throws Exception {
        var calculationApiClient = new CalculationApiClient();
        try {
            var apiResponse = calculationApiClient.calculate(request);
            var data = mapResponse((ResponseEntity<?>) apiResponse);

            var analysis = AnalysisMapper.MapApiToAnalysis(data, new Analise());

            analysis.setTipo(TipoPlantio.valueOf(request.tipo()));

            var usuario = userRepository.findByEmail(request.email()).orElseThrow();
            analysis.setUsuario(usuario);

            var analise = analiseRepository.save(analysis);

            var recomedacao = buildRecomendacao(data, analise);
            var interpretacao = buildInterpretacao(data, analise);

            var mappedAnalysis = AnalysisMapper.MapAnalysisToCreateResponse(analysis, new CreateAnalysisResponse());

            mappedAnalysis.setRecomendacao(recomedacao);
            mappedAnalysis.setInterpretacao(interpretacao);

            return mappedAnalysis;

        } catch (Exception e) {
          throw new Exception("Erro durante chamada de api", e);
        }
    }

    private List<InterpretacaoDto> buildInterpretacao(Map<String, Object> data, Analise analise) {
        List<String> interpretacoesString = new ArrayList<>();
        if (data.get("interpretacao") instanceof List<?>) {
            interpretacoesString = ((List<?>) data.get("interpretacao"))
                    .stream()
                    .map(String::valueOf)
                    .toList();
        }

        List<Interpretacao> interpretacaos = new ArrayList<>();

        for (String interpretacoesItem : interpretacoesString) {
            Interpretacao interpretacao = new Interpretacao();
            interpretacao.setDescricao(interpretacoesItem);
            interpretacao.setAnalise(analise);
            interpretacao = interpretacaoRepository.save(interpretacao);
            interpretacaos.add(interpretacao);
        }

        return interpretacaos.stream().map(InterpretacaoDto::new).toList();
    }

    private List<RecomendacaoDto> buildRecomendacao(Map<String, Object> data, Analise analise){
        List<String> recomendacoesString = new ArrayList<>();
        if (data.get("recomendacao") instanceof List<?>) {
            recomendacoesString = ((List<?>) data.get("recomendacao"))
                    .stream()
                    .map(String::valueOf)
                    .toList();
        }

        List<Recomendacao> recomendacaos = new ArrayList<>();

        for (String recomendacoesItem : recomendacoesString) {
            Recomendacao recomendacao = new Recomendacao();
            recomendacao.setDescricao(recomendacoesItem);
            recomendacao.setAnalise(analise);
            recomendacao = recomendacaoRepository.save(recomendacao);
            recomendacaos.add(recomendacao);
        }

        return recomendacaos.stream().map(RecomendacaoDto::new).toList();
    }

    private Map<String, Object> mapResponse(ResponseEntity<?> response){
        String json = response.getBody() != null ? response.getBody().toString() : null;
        return objectMapper.readValue(json, new TypeReference<>() {});
    }

}
