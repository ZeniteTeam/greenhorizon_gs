package com.br.green_horizon.Horizon.monitoring.application.entities;

import com.br.green_horizon.Horizon.shared.json.JsonListConverter;
import jakarta.persistence.Converter;
import tools.jackson.core.type.TypeReference;

import java.util.List;

@Converter
public class RainReadingListConverter extends JsonListConverter<RainReading> {
    public RainReadingListConverter() {
        super(new TypeReference<List<RainReading>>() {
        });
    }
}
