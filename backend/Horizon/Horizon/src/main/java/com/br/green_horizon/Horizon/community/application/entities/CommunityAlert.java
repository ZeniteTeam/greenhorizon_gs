package com.br.green_horizon.Horizon.community.application.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_community_alert")
@Getter
@Setter
@NoArgsConstructor
public class CommunityAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    /** act | watch | info */
    private String severity;
    private String title;
    @Column(length = 2_000)
    private String body;
    private LocalDateTime createdAt;
}
