package com.br.green_horizon.Horizon.analysis.infrastructure.repository;

import com.br.green_horizon.Horizon.analysis.application.entities.Analise;
import com.br.green_horizon.Horizon.analysis.application.entities.Recomendacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IRecomendacaoRepository extends JpaRepository<Recomendacao,Long> {
    List<Recomendacao> findByAnalise(Analise analise);


}
