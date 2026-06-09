package com.br.green_horizon.Horizon.analysis.data.response;

import com.br.green_horizon.Horizon.analysis.application.entities.Analise;
import com.br.green_horizon.Horizon.analysis.application.entities.Recomendacao;
import com.br.green_horizon.Horizon.analysis.application.enums.Clima;
import com.br.green_horizon.Horizon.analysis.application.enums.Status;
import com.br.green_horizon.Horizon.analysis.application.enums.TipoPlantio;
import lombok.*;

import java.util.Date;
import java.util.List;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GetHistoricoListResponse {
    private Long id;
    private Double ndviMedia;
    private Double areaTotalPercentual;
    private Double coberturaVegetal;
    private TipoPlantio tipo;
    private Clima clima;
    private Status status;
    private List<RecomendacaoDto> recomendacao;
    private List<InterpretacaoDto> interpretacao;
    private Date date;
    private String temporada;
    private String safra;
    private String tileUrl;

    public GetHistoricoListResponse(Analise analise) {
        this.id = analise.getId();
        this.ndviMedia = analise.getNdviMedia();
        this.areaTotalPercentual = analise.getAreaTotalPorHectar();
        this.coberturaVegetal = analise.getCoberturaVegetalPercentual();
        this.tipo = analise.getTipo();
        this.clima = analise.getClima();
        this.status = analise.getStatus();
        this.date = analise.getDate();
        this.temporada = analise.getTemporada();
        this.safra = analise.getSafra();
        this.tileUrl = analise.getTileUrl();
    }

}
