package com.br.green_horizon.Horizon.monitoring.controllers;

import com.br.green_horizon.Horizon.monitoring.application.facade.MonitoringFacade;
import com.br.green_horizon.Horizon.monitoring.data.request.MonitoringRequests;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldExtrasResponses;
import com.br.green_horizon.Horizon.shared.web.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/visits")
public class VisitController {

    private final MonitoringFacade facade;

    public VisitController(MonitoringFacade facade) {
        this.facade = facade;
    }

    @PostMapping
    public ResponseEntity<FieldExtrasResponses.TechnicianVisit> request(@RequestHeader(CurrentUser.HEADER) Long userId,
                                                                        @Valid @RequestBody MonitoringRequests.RequestVisit request) {
        return ResponseEntity.ok(facade.requestVisit(userId, request));
    }
}
