package com.br.green_horizon.Horizon.monitoring.application.entities;

import com.br.green_horizon.Horizon.monitoring.application.enums.Crop;
import com.br.green_horizon.Horizon.shared.geo.Geo;
import com.br.green_horizon.Horizon.shared.json.LatLngListConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** A monitored field (talhão). The latest satellite season is stored with it as JSON. */
@Entity
@Table(name = "tb_field")
@Getter
@Setter
@NoArgsConstructor
public class Field {

    private static final int JSON_COLUMN_LENGTH = 200_000;

    @Id
    private String id;
    private Long ownerId;
    private String name;
    private String farm;
    private String municipality;
    @Enumerated(EnumType.STRING)
    private Crop crop;
    private LocalDate plantedAt;

    @Convert(converter = LatLngListConverter.class)
    @Column(length = JSON_COLUMN_LENGTH)
    private List<double[]> boundary = new ArrayList<>();
    private Double entranceLat;
    private Double entranceLng;

    @Convert(converter = SatelliteReadingListConverter.class)
    @Column(length = JSON_COLUMN_LENGTH)
    private List<SatelliteReading> samples = new ArrayList<>();

    @Convert(converter = RainReadingListConverter.class)
    @Column(length = JSON_COLUMN_LENGTH)
    private List<RainReading> rain = new ArrayList<>();

    private Instant syncedAt;

    public double[] entrance() {
        return new double[]{entranceLat, entranceLng};
    }

    public double[] centroid() {
        return Geo.centroid(boundary);
    }

    public double areaHa() {
        return Geo.areaHa(boundary);
    }
}
