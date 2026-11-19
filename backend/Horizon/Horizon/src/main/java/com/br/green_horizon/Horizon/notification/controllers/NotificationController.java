package com.br.green_horizon.Horizon.notification.controllers;

import com.br.green_horizon.Horizon.notification.application.facade.NotificationFacade;
import com.br.green_horizon.Horizon.notification.data.response.NotificationResponse;
import com.br.green_horizon.Horizon.shared.web.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationFacade facade;

    public NotificationController(NotificationFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> list(@RequestHeader(CurrentUser.HEADER) Long userId) {
        return ResponseEntity.ok(facade.list(userId));
    }
}
