package com.br.green_horizon.Horizon.analysis.application.entities;

import com.br.green_horizon.Horizon.user.application.entities.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity()
@Table(name = "tb_recomendacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Recomendacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String descricao;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_analise")
    private Analise analise;
}
