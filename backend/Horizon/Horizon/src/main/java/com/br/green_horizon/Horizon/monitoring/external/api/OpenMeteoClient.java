package com.br.green_horizon.Horizon.monitoring.external.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Daily weather from Open-Meteo (free, no API key): recent days and the forecast.
 * Leaf wetness is estimated as the hours with relative humidity of 90% or more.
 */
@Component
public class OpenMeteoClient {

    private static final int LEAF_WET_HUMIDITY = 90;
    private static final String TIMEZONE = "America/Sao_Paulo";

    private final RestClient rest;

    public OpenMeteoClient(@Value("${open-meteo.url:https://api.open-meteo.com}") String baseUrl) {
        this.rest = RestClient.create(baseUrl);
    }

    public List<DayWeather> daily(double lat, double lng, int pastDays, int forecastDays) {
        Response response;
        try {
            response = rest.get()
                    .uri("/v1/forecast?latitude={lat}&longitude={lng}"
                                    + "&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,precipitation_probability_max"
                                    + "&hourly=relative_humidity_2m&past_days={past}&forecast_days={forecast}&timezone={tz}",
                            lat, lng, pastDays, forecastDays, TIMEZONE)
                    .retrieve()
                    .body(Response.class);
        } catch (RestClientException error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Previsão do tempo indisponível no momento.", error);
        }
        if (response == null || response.daily() == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Previsão do tempo indisponível no momento.");
        }
        return toDays(response);
    }

    private static List<DayWeather> toDays(Response response) {
        Daily daily = response.daily();
        List<Double> humidity = response.hourly().relative_humidity_2m();
        List<DayWeather> days = new ArrayList<>();
        for (int i = 0; i < daily.time().size(); i++) {
            // Hourly values are aligned with the days: 24 per day, starting at the first day.
            List<Double> hours = humidity.subList(Math.min(i * 24, humidity.size()), Math.min((i + 1) * 24, humidity.size()));
            List<Double> known = hours.stream().filter(h -> h != null).toList();
            days.add(new DayWeather(
                    LocalDate.parse(daily.time().get(i)),
                    daily.temperature_2m_min().get(i),
                    daily.temperature_2m_max().get(i),
                    daily.precipitation_sum().get(i),
                    daily.precipitation_probability_max().get(i),
                    known.isEmpty() ? null : (int) Math.round(known.stream().mapToDouble(Double::doubleValue).average().orElse(0)),
                    (int) known.stream().filter(h -> h >= LEAF_WET_HUMIDITY).count()
            ));
        }
        return days;
    }

    public record DayWeather(LocalDate date, Double minC, Double maxC, Double rainMm, Double rainChance,
                             Integer humidity, int leafWetnessHours) {
    }

    private record Response(Daily daily, Hourly hourly) {
    }

    private record Daily(List<String> time, List<Double> temperature_2m_min, List<Double> temperature_2m_max,
                         List<Double> precipitation_sum, List<Double> precipitation_probability_max) {
    }

    private record Hourly(List<Double> relative_humidity_2m) {
    }
}
