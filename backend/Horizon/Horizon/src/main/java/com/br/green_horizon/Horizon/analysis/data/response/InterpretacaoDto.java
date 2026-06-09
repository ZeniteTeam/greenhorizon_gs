package com.br.green_horizon.Horizon.analysis.data.response;

import com.br.green_horizon.Horizon.analysis.application.entities.Interpretacao;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterpretacaoDto{
    private Long id;
    private String descricao;

    public InterpretacaoDto(Interpretacao interpretacao){
        this.id = interpretacao.getId();
        this.descricao = interpretacao.getDescricao();
    }

}
