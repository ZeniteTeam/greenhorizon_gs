package com.br.green_horizon.Horizon.analysis.data.response;

import com.br.green_horizon.Horizon.analysis.application.entities.Recomendacao;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecomendacaoDto{
    private Long id;
    private String descricao;

    public RecomendacaoDto(Recomendacao recomendacao){
        this.id = recomendacao.getId();
        this.descricao = recomendacao.getDescricao();
    }

}