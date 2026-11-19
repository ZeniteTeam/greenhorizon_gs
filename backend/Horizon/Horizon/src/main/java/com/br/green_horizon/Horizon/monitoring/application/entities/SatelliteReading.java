package com.br.green_horizon.Horizon.monitoring.application.entities;

/** One Sentinel-2 pass over a field, as returned by the calculation service. */
public record SatelliteReading(
        String date,
        Double fieldNdvi,
        Double zoneNdvi,
        Double fieldNdmi,
        Double zoneNdmi,
        double cloudMasked
) {
}
