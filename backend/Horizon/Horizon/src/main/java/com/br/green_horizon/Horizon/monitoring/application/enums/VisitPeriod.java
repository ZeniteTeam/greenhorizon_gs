package com.br.green_horizon.Horizon.monitoring.application.enums;

/** Constant names are the wire values used by the frontend. */
public enum VisitPeriod {
    manha("manhã"),
    tarde("tarde");

    private final String label;

    VisitPeriod(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
