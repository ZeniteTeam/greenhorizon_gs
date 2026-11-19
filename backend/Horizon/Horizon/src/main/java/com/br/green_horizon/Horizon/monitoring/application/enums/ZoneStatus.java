package com.br.green_horizon.Horizon.monitoring.application.enums;

public enum ZoneStatus {
    AWAITING_PHOTO("awaiting-photo"),
    CONFIRMED("confirmed"),
    DISMISSED("dismissed");

    private final String wire;

    ZoneStatus(String wire) {
        this.wire = wire;
    }

    public String wire() {
        return wire;
    }
}
