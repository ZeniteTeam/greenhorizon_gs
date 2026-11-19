package com.br.green_horizon.Horizon.monitoring.application.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * A leaf photo sent for a zone and the AI diagnosis it got. Once the farmer confirms or dismisses
 * the zone, {@code confirmedLabel} holds the ground truth for training a dedicated model later.
 */
@Entity
@Table(name = "tb_leaf_photo")
@Getter
@Setter
@NoArgsConstructor
public class LeafPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String zoneId;
    private Long userId;
    private String path;
    private String sha256;
    private String label;
    private Double confidence;
    @Column(length = 20_000)
    private String resultJson;
    private String confirmedLabel;
    private LocalDateTime createdAt;
}
