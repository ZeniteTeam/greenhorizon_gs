package com.br.green_horizon.Horizon.monitoring.controllers;

import com.br.green_horizon.Horizon.monitoring.application.facade.MonitoringFacade;
import com.br.green_horizon.Horizon.monitoring.data.request.MonitoringRequests;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldExtrasResponses;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldResponses;
import com.br.green_horizon.Horizon.shared.web.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/fields")
public class FieldController {

    private final MonitoringFacade facade;

    public FieldController(MonitoringFacade facade) {
        this.facade = facade;
    }

    @GetMapping
    public ResponseEntity<List<FieldResponses.FieldSummary>> list(@RequestHeader(CurrentUser.HEADER) Long userId) {
        return ResponseEntity.ok(facade.fields(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FieldResponses.FieldDetail> detail(@RequestHeader(CurrentUser.HEADER) Long userId,
                                                             @PathVariable String id) {
        return ResponseEntity.ok(facade.field(id, userId));
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<FieldResponses.FieldDetail> sync(@RequestHeader(CurrentUser.HEADER) Long userId,
                                                           @PathVariable String id) {
        return ResponseEntity.ok(facade.syncField(id, userId));
    }

    @GetMapping("/{id}/tiles")
    public ResponseEntity<FieldResponses.Tile> tile(
            @RequestHeader(CurrentUser.HEADER) Long userId,
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String layer,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate previousDate) {
        return ResponseEntity.ok(facade.tile(id, userId, date, layer, previousDate));
    }

    @GetMapping("/{id}/weather")
    public ResponseEntity<FieldExtrasResponses.FieldWeather> weather(@RequestHeader(CurrentUser.HEADER) Long userId,
                                                                     @PathVariable String id) {
        return ResponseEntity.ok(facade.weather(id, userId));
    }

    @GetMapping("/{id}/events")
    public ResponseEntity<List<FieldExtrasResponses.FieldEvent>> events(@RequestHeader(CurrentUser.HEADER) Long userId,
                                                                        @PathVariable String id) {
        return ResponseEntity.ok(facade.events(id, userId));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<FieldExtrasResponses.FieldEvent> addNote(@RequestHeader(CurrentUser.HEADER) Long userId,
                                                                   @PathVariable String id,
                                                                   @Valid @RequestBody MonitoringRequests.AddNote request) {
        return ResponseEntity.ok(facade.addNote(id, userId, request));
    }

    @GetMapping("/{id}/visits")
    public ResponseEntity<List<FieldExtrasResponses.TechnicianVisit>> visits(@RequestHeader(CurrentUser.HEADER) Long userId,
                                                                             @PathVariable String id) {
        return ResponseEntity.ok(facade.visits(id, userId));
    }
}
