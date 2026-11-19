package com.br.green_horizon.Horizon.monitoring.application.service.weather;

import com.br.green_horizon.Horizon.monitoring.application.entities.Field;
import com.br.green_horizon.Horizon.monitoring.application.port.RegionalOutbreaks;
import com.br.green_horizon.Horizon.monitoring.application.service.zone.HypothesisBuilder;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldExtrasResponses.FieldWeather;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldExtrasResponses.ForecastDay;
import com.br.green_horizon.Horizon.monitoring.external.api.OpenMeteoClient;
import com.br.green_horizon.Horizon.monitoring.external.api.OpenMeteoClient.DayWeather;
import com.br.green_horizon.Horizon.shared.geo.Geo;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

/** 7-day forecast, disease risk and rain of the last 30 days against the CHIRPS normal. */
@Service
public class FieldWeatherUseCase {

    private static final int PAST_DAYS = 30;
    private static final int FORECAST_DAYS = 7;

    private final OpenMeteoClient openMeteo;
    private final RegionalOutbreaks regionalOutbreaks;
    private final Clock clock;

    public FieldWeatherUseCase(OpenMeteoClient openMeteo, RegionalOutbreaks regionalOutbreaks, Clock clock) {
        this.openMeteo = openMeteo;
        this.regionalOutbreaks = regionalOutbreaks;
        this.clock = clock;
    }

    public FieldWeather weather(Field field) {
        LocalDate today = LocalDate.now(clock);
        LocalDate windowStart = today.minusDays(PAST_DAYS);
        double[] center = field.centroid();
        List<DayWeather> days = openMeteo.daily(center[0], center[1], PAST_DAYS, FORECAST_DAYS);

        List<DayWeather> forecast = days.stream().filter(d -> !d.date().isBefore(today)).limit(FORECAST_DAYS).toList();
        double rain30d = days.stream()
                .filter(d -> d.date().isBefore(today) && !d.date().isBefore(windowStart) && d.rainMm() != null)
                .mapToDouble(DayWeather::rainMm)
                .sum();
        double normal30d = field.getRain().stream()
                .filter(r -> LocalDate.parse(r.date()).isAfter(windowStart))
                .mapToDouble(r -> r.normalMm())
                .sum();

        var nearby = regionalOutbreaks.confirmedNear(center, HypothesisBuilder.NEARBY_OUTBREAK_KM, null);
        return new FieldWeather(
                forecast.stream().map(FieldWeatherUseCase::toForecastDay).toList(),
                DiseaseRiskRules.evaluate(field.getCrop(), forecast, nearby),
                Geo.round(rain30d, 0),
                Geo.round(normal30d, 0));
    }

    private static ForecastDay toForecastDay(DayWeather d) {
        return new ForecastDay(
                d.date().toString(),
                roundOrZero(d.minC()),
                roundOrZero(d.maxC()),
                roundOrZero(d.rainMm()),
                roundOrZero(d.rainChance()),
                d.humidity() == null ? 0 : d.humidity(),
                d.leafWetnessHours());
    }

    private static int roundOrZero(Double value) {
        return value == null ? 0 : (int) Math.round(value);
    }
}
