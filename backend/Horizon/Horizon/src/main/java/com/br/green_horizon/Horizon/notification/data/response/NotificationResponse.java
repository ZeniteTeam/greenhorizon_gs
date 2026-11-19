package com.br.green_horizon.Horizon.notification.data.response;

import com.fasterxml.jackson.annotation.JsonInclude;

/** Mirrors AppNotification in frontend/src/types/monitoring.ts. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record NotificationResponse(String id, String kind, String title, String body, String createdAt,
                                   String fieldId, String target) {
}
