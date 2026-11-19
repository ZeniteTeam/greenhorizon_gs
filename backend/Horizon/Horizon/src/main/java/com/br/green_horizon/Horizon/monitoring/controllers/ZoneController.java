package com.br.green_horizon.Horizon.monitoring.controllers;

import com.br.green_horizon.Horizon.monitoring.application.facade.MonitoringFacade;
import com.br.green_horizon.Horizon.monitoring.data.request.MonitoringRequests;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldExtrasResponses;
import com.br.green_horizon.Horizon.shared.web.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/zones")
public class ZoneController {

    private final MonitoringFacade facade;

    public ZoneController(MonitoringFacade facade) {
        this.facade = facade;
    }

    @PostMapping(path = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FieldExtrasResponses.LeafDiagnosis> diagnose(@RequestHeader(CurrentUser.HEADER) Long userId,
                                                                       @PathVariable String id,
                                                                       @RequestPart("photo") MultipartFile photo) {
        return ResponseEntity.ok(facade.diagnoseLeaf(id, userId, photo));
    }

    @PostMapping("/{id}/confirmation")
    public ResponseEntity<Void> confirm(@RequestHeader(CurrentUser.HEADER) Long userId,
                                        @PathVariable String id,
                                        @Valid @RequestBody MonitoringRequests.ConfirmZone request) {
        facade.confirmZone(id, userId, request.diagnosis());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/dismissal")
    public ResponseEntity<Void> dismiss(@RequestHeader(CurrentUser.HEADER) Long userId, @PathVariable String id) {
        facade.dismissZone(id, userId);
        return ResponseEntity.noContent().build();
    }
}
