package com.br.green_horizon.Horizon.shared.json;

import jakarta.persistence.AttributeConverter;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.List;

/** Stores a list as a JSON text column. Subclasses only supply the element type. */
public abstract class JsonListConverter<T> implements AttributeConverter<List<T>, String> {

    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    private final TypeReference<List<T>> type;

    protected JsonListConverter(TypeReference<List<T>> type) {
        this.type = type;
    }

    @Override
    public String convertToDatabaseColumn(List<T> value) {
        return value == null ? null : MAPPER.writeValueAsString(value);
    }

    @Override
    public List<T> convertToEntityAttribute(String json) {
        return json == null || json.isBlank() ? new ArrayList<>() : new ArrayList<>(MAPPER.readValue(json, type));
    }
}
