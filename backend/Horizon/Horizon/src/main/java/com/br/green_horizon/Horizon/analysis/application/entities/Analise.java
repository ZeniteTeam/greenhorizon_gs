package com.br.green_horizon.Horizon.analysis.application.entities;
import com.br.green_horizon.Horizon.analysis.application.enums.Clima;
import com.br.green_horizon.Horizon.analysis.application.enums.Status;
import com.br.green_horizon.Horizon.analysis.application.enums.TipoPlantio;
import com.br.green_horizon.Horizon.user.application.entities.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Entity()
@Table(name = "tb_analise")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Analise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Double ndviMedia;
    private Double areaTotalPorHectar;
    private Double coberturaVegetalPercentual;
    private TipoPlantio tipo;
    private Clima clima;
    private Status status;
    @OneToMany(mappedBy = "analise", fetch = FetchType.LAZY)
    private List<Interpretacao> intepretacoes;

    @OneToMany(mappedBy = "analise", fetch = FetchType.LAZY)
    private List<Recomendacao> recomendacoes;
    private Date date;
    private String temporada;
    private String safra;
    @Column(length = 800)
    private String tileUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private User usuario;

}
