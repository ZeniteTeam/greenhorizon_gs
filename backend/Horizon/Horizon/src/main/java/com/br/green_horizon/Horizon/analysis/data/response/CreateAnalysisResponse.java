package com.br.green_horizon.Horizon.analysis.data.response;

import com.br.green_horizon.Horizon.analysis.application.enums.Clima;
import com.br.green_horizon.Horizon.analysis.application.enums.Status;
import com.br.green_horizon.Horizon.analysis.application.enums.TipoPlantio;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateAnalysisResponse {
    private Long id;
    private Double ndviMedia;
    @Enumerated(EnumType.STRING)
    private TipoPlantio tipo;
    @Enumerated(EnumType.STRING)
    private Clima clima;
    @Enumerated(EnumType.STRING)
    private Status status;
    private List<RecomendacaoDto> recomendacao;
    private List<InterpretacaoDto> interpretacao;
    private Date date;
    private String temporada;
    private String safra;
    private Double coberturaVegetal;
    private Double areaTotalPercentual;
    private String tileUrl;



}
