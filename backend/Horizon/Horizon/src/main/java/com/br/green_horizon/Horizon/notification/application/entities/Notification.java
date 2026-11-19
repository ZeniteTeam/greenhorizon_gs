package com.br.green_horizon.Horizon.notification.application.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_notification")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    /** zone | outbreak | risk | pass | visit | diagnosis */
    private String kind;
    private String title;
    @Column(length = 2_000)
    private String body;
    private LocalDateTime createdAt;
    private String fieldId;
    /** Screen to open: fields | field | community */
    private String target;
}
