package com.br.green_horizon.Horizon.monitoring.application.port;

import java.util.List;

/**
 * Confirmed outbreaks around a point. Implemented by the community module, so monitoring can use
 * regional context (hypothesis evidence, disease risk) without depending on community internals.
 */
public interface RegionalOutbreaks {

    /** Confirmed outbreaks within {@code radiusKm}, nearest first, ignoring the one created from {@code excludeZoneId}. */
    List<NearbyOutbreak> confirmedNear(double[] point, double radiusKm, String excludeZoneId);

    record NearbyOutbreak(String disease, double distanceKm, String locality) {
    }
}
