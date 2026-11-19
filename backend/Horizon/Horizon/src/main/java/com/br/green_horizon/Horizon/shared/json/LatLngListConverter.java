package com.br.green_horizon.Horizon.shared.json;

import jakarta.persistence.Converter;
import tools.jackson.core.type.TypeReference;

import java.util.List;

/** Polygon rings as {@code [[lat, lng], ...]}. */
@Converter
public class LatLngListConverter extends JsonListConverter<double[]> {
    public LatLngListConverter() {
        super(new TypeReference<List<double[]>>() {
        });
    }
}
