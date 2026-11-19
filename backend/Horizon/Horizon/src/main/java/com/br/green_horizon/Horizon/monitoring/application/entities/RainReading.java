package com.br.green_horizon.Horizon.monitoring.application.entities;

/** Rain in the 5 days ending at {@code date}, with the 30-year normal for the same days. */
public record RainReading(String date, Double mm, double normalMm) {
}
