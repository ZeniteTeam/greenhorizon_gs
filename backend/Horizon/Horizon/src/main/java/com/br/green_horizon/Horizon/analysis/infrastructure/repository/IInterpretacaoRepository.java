package com.br.green_horizon.Horizon.analysis.infrastructure.repository;

import com.br.green_horizon.Horizon.analysis.application.entities.Analise;
import com.br.green_horizon.Horizon.analysis.application.entities.Interpretacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IInterpretacaoRepository extends JpaRepository<Interpretacao, Long>{
    List<Interpretacao> findByAnalise(Analise analise);

}
