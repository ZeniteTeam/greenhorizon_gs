package com.br.green_horizon.Horizon.user.application.entities;

import com.br.green_horizon.Horizon.analysis.application.entities.Analise;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity()
@Table(name = "tb_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String username;
    private String email;
    private String password;

    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    private List<Analise> analiseList;

}
