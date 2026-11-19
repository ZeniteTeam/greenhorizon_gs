package com.br.green_horizon.Horizon.monitoring.data.request;

import com.br.green_horizon.Horizon.monitoring.application.enums.VisitPeriod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public final class MonitoringRequests {

    private MonitoringRequests() {
    }

    public record AddNote(@NotBlank @Size(max = 2000) String text, @Size(max = 120) String author) {
    }

    public record RequestVisit(@NotBlank String fieldId, String zoneId, @NotNull LocalDate date,
                               @NotNull VisitPeriod period, @Size(max = 2000) String note) {
    }

    public record ConfirmZone(@NotBlank @Size(max = 200) String diagnosis) {
    }
}
