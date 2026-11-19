package com.br.green_horizon.Horizon.community.application.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * A disease outbreak on the regional map. Outbreaks created from a stress zone keep the zone id
 * ({@code sourceZoneId}) and the producer details used by the visit-priority list.
 */
@Entity
@Table(name = "tb_outbreak")
@Getter
@Setter
@NoArgsConstructor
public class Outbreak {

    public static final String CONFIRMED = "confirmed";
    public static final String SUSPECTED = "suspected";

    @Id
    private String id;
    private String disease;
    private String status;
    private double lat;
    private double lng;
    private LocalDate reportedAt;
    /** Place name shown on the map (community, gleba or field). */
    private String locality;

    private String sourceZoneId;
    private String fieldId;
    private Long ownerId;
    private String producer;
    private String fieldName;
    private String municipality;
    private Double areaHa;
    private Double vigorDropPct;
    private int alertedProducers;
    private boolean visitScheduled;

    public double[] position() {
        return new double[]{lat, lng};
    }

    public boolean isConfirmed() {
        return CONFIRMED.equals(status);
    }
}
