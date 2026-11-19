package com.br.green_horizon.Horizon.notification.application.facade;

import com.br.green_horizon.Horizon.notification.application.entities.Notification;
import com.br.green_horizon.Horizon.notification.data.response.NotificationResponse;
import com.br.green_horizon.Horizon.notification.infrastructure.repository.INotificationRepository;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** In-app notifications. Other modules call {@link #notify} directly or through events. */
@Service
public class NotificationFacade {

    private final INotificationRepository repository;
    private final Clock clock;

    public NotificationFacade(INotificationRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    public void notify(Long userId, String kind, String title, String body, String fieldId, String target) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setKind(kind);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setFieldId(fieldId);
        notification.setTarget(target);
        notification.setCreatedAt(LocalDateTime.now(clock));
        repository.save(notification);
    }

    /** Same as {@link #notify}, but at most once per user, field and title per day. */
    public void notifyOncePerDay(Long userId, String kind, String title, String body, String fieldId, String target) {
        LocalDateTime startOfDay = LocalDate.now(clock).atStartOfDay();
        if (!repository.existsByUserIdAndFieldIdAndTitleAndCreatedAtAfter(userId, fieldId, title, startOfDay)) {
            notify(userId, kind, title, body, fieldId, target);
        }
    }

    public List<NotificationResponse> list(Long userId) {
        return repository.findTop50ByUserIdOrderByCreatedAtDescIdDesc(userId).stream()
                .map(n -> new NotificationResponse(String.valueOf(n.getId()), n.getKind(), n.getTitle(), n.getBody(),
                        n.getCreatedAt().toString(), n.getFieldId(), n.getTarget()))
                .toList();
    }
}
