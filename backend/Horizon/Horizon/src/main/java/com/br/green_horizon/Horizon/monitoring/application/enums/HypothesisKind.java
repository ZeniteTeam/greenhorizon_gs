package com.br.green_horizon.Horizon.monitoring.application.enums;

public enum HypothesisKind {
    PEST_OR_DISEASE("pest-or-disease", "Provável praga ou doença"),
    WATER_STRESS("water-stress", "Provável falta de água"),
    NUTRIENT("nutrient", "Provável deficiência de nutrientes"),
    NATURAL_CYCLE("natural-cycle", "Provável fim de ciclo natural");

    private final String wire;
    private final String label;

    HypothesisKind(String wire, String label) {
        this.wire = wire;
        this.label = label;
    }

    public String wire() {
        return wire;
    }

    public String label() {
        return label;
    }
}
