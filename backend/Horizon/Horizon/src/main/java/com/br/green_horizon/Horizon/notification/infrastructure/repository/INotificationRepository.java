package com.br.green_horizon.Horizon.notification.infrastructure.repository;

import com.br.green_horizon.Horizon.notification.application.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface INotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop50ByUserIdOrderByCreatedAtDescIdDesc(Long userId);

    boolean existsByUserIdAndFieldIdAndTitleAndCreatedAtAfter(Long userId, String fieldId, String title,
                                                              LocalDateTime after);
}
