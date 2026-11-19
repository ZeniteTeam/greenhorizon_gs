package com.br.green_horizon.Horizon.community.controllers;

import com.br.green_horizon.Horizon.community.application.service.CommunityEventsListener;
import com.br.green_horizon.Horizon.community.application.service.GetCommunityOverviewUseCase;
import com.br.green_horizon.Horizon.community.data.response.CommunityOverviewResponse;
import com.br.green_horizon.Horizon.shared.web.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/community")
public class CommunityController {

    private final GetCommunityOverviewUseCase overview;

    public CommunityController(GetCommunityOverviewUseCase overview) {
        this.overview = overview;
    }

    @GetMapping("/overview")
    public ResponseEntity<CommunityOverviewResponse> overview(
            @RequestHeader(CurrentUser.HEADER) Long userId,
            @RequestParam(defaultValue = "" + CommunityEventsListener.ALERT_RADIUS_KM) double radiusKm) {
        return ResponseEntity.ok(overview.overview(userId, radiusKm));
    }
}
