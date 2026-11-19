package com.br.green_horizon.Horizon.monitoring.application.entities;

import com.br.green_horizon.Horizon.monitoring.application.enums.FieldEventKind;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** One entry of a field's timeline (passes, zones, diagnoses, visits, notes). */
@Entity
@Table(name = "tb_field_event")
@Getter
@Setter
@NoArgsConstructor
public class FieldEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fieldId;
    private LocalDate date;
    @Enumerated(EnumType.STRING)
    private FieldEventKind kind;
    private String title;
    @Column(length = 2_000)
    private String description;
    private String author;
}
