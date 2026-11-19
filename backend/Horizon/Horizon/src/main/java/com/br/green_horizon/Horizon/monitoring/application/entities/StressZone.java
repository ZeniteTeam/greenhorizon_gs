package com.br.green_horizon.Horizon.monitoring.application.entities;

import com.br.green_horizon.Horizon.monitoring.application.enums.ZoneStatus;
import com.br.green_horizon.Horizon.shared.json.LatLngListConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/** Part of a field that lost vigor between two satellite passes. */
@Entity
@Table(name = "tb_stress_zone")
@Getter
@Setter
@NoArgsConstructor
public class StressZone {

    @Id
    private String id;
    private String fieldId;

    @Convert(converter = LatLngListConverter.class)
    @Column(length = 100_000)
    private List<double[]> polygon = new ArrayList<>();
    private double areaHa;

    /** Pass in which the drop was seen, and the earlier pass it was compared with. */
    private LocalDate detectedAt;
    private LocalDate comparedWith;
    private double vigorDropPct;
    private double fieldDropPct;
    private Double ndmiBefore;
    private Double ndmiAfter;

    private double scoutLat;
    private double scoutLng;

    @Enumerated(EnumType.STRING)
    private ZoneStatus status;
    private String diagnosis;

    public double[] scoutPoint() {
        return new double[]{scoutLat, scoutLng};
    }

    public int windowDays() {
        return (int) ChronoUnit.DAYS.between(comparedWith, detectedAt);
    }
}
