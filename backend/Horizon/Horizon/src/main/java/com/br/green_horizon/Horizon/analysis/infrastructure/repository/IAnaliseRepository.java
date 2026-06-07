package com.br.green_horizon.Horizon.analysis.infrastructure.repository;
import com.br.green_horizon.Horizon.analysis.application.entities.Analise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IAnaliseRepository extends JpaRepository<Analise, Long> {
    List<Analise> findByUsuarioId(long id);

}
