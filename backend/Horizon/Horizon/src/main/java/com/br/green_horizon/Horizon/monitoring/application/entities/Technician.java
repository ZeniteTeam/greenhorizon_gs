package com.br.green_horizon.Horizon.monitoring.application.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Extension technician (Emater, cooperative) serving a municipality. */
@Entity
@Table(name = "tb_technician")
@Getter
@Setter
@NoArgsConstructor
public class Technician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String organization;
    private String phone;
    private String municipality;
}
