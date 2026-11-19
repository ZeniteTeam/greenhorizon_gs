package com.br.green_horizon.Horizon.monitoring.application.entities;

import com.br.green_horizon.Horizon.monitoring.application.enums.VisitPeriod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "tb_technician_visit")
@Getter
@Setter
@NoArgsConstructor
public class TechnicianVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fieldId;
    private String zoneId;
    private LocalDate date;
    @Enumerated(EnumType.STRING)
    private VisitPeriod period;
    private String technician;
    private String organization;
    private String phone;
    @Column(length = 2_000)
    private String note;
    private String status;
}
