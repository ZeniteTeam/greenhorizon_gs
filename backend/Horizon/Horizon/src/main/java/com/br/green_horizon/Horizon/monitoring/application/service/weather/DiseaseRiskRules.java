package com.br.green_horizon.Horizon.monitoring.application.service.weather;

import com.br.green_horizon.Horizon.monitoring.application.enums.Crop;
import com.br.green_horizon.Horizon.monitoring.application.port.RegionalOutbreaks.NearbyOutbreak;
import com.br.green_horizon.Horizon.monitoring.data.response.FieldExtrasResponses.DiseaseRisk;
import com.br.green_horizon.Horizon.monitoring.external.api.OpenMeteoClient.DayWeather;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;

import static com.br.green_horizon.Horizon.shared.format.PtBr.number;

/**
 * Simplified disease-risk heuristics from the weather forecast, based on the conditions known to
 * favor each fungus (leaf wetness, humidity, temperature). Not a validated epidemiological model.
 */
public final class DiseaseRiskRules {

    private static final double RAINY_DAY_MM = 5;
    private static final int WET_DAY_HOURS = 10;

    private DiseaseRiskRules() {
    }

    public static List<DiseaseRisk> evaluate(Crop crop, List<DayWeather> forecast, List<NearbyOutbreak> nearby) {
        if (forecast.isEmpty()) {
            return List.of();
        }
        return switch (crop) {
            case Soja -> soy(forecast, nearby);
            case Milho -> corn(forecast);
            case Arroz -> rice(forecast);
        };
    }

    private static List<DiseaseRisk> soy(List<DayWeather> f, List<NearbyOutbreak> nearby) {
        long rainyDays = count(f, d -> d.rainMm() != null && d.rainMm() >= RAINY_DAY_MM);
        long wetDays = count(f, d -> d.leafWetnessHours() >= WET_DAY_HOURS);
        long mildDays = count(f, d -> d.minC() != null && d.maxC() != null && d.minC() >= 15 && d.maxC() <= 30);
        long humidDays = count(f, d -> d.humidity() != null && d.humidity() >= 80);
        Optional<NearbyOutbreak> rust = nearby.stream().filter(o -> o.disease().toLowerCase().contains("ferrugem")).findFirst();

        String rustLevel;
        if ((rainyDays >= 4 && wetDays >= 4 && mildDays >= 3) || (rust.isPresent() && wetDays >= 2)) {
            rustLevel = "high";
        } else if (wetDays >= 2 || rainyDays >= 3) {
            rustLevel = "moderate";
        } else {
            rustLevel = "low";
        }
        List<String> rustReasons = new ArrayList<>(List.of(
                "Chuva em " + rainyDays + " dos próximos " + f.size() + " dias",
                wetDays + " dias com mais de " + WET_DAY_HOURS + " h de folha molhada",
                "Temperatura entre " + minTemp(f) + " e " + maxTemp(f) + " °C"));
        rust.ifPresent(o -> rustReasons.add("Foco confirmado a " + number(o.distanceKm(), 0) + " km"));

        return List.of(
                new DiseaseRisk("Ferrugem asiática", rustLevel, rustReasons),
                new DiseaseRisk("Mancha-alvo", humidDays >= 5 ? "moderate" : "low",
                        List.of("Umidade acima de 80% em " + humidDays + " dias")));
    }

    private static List<DiseaseRisk> corn(List<DayWeather> f) {
        long veryHumid = count(f, d -> d.humidity() != null && d.humidity() >= 85);
        long wetDays = count(f, d -> d.leafWetnessHours() >= WET_DAY_HOURS);
        long warmDays = count(f, d -> d.maxC() != null && d.maxC() >= 25 && d.maxC() <= 35);
        return List.of(
                new DiseaseRisk("Cercosporiose", veryHumid >= 4 ? "moderate" : "low",
                        List.of("Umidade acima de 85% em " + veryHumid + " dias")),
                new DiseaseRisk("Ferrugem polissora", wetDays >= 4 && warmDays >= 4 ? "moderate" : "low",
                        List.of(wetDays + " dias com folha molhada e " + warmDays + " dias quentes (25 a 35 °C)")));
    }

    private static List<DiseaseRisk> rice(List<DayWeather> f) {
        long wetDays = count(f, d -> d.leafWetnessHours() >= WET_DAY_HOURS);
        long mildNights = count(f, d -> d.minC() != null && d.minC() >= 20 && d.minC() <= 28);
        String level = wetDays >= 5 && mildNights >= 4 ? "high" : wetDays >= 3 ? "moderate" : "low";
        return List.of(new DiseaseRisk("Brusone", level, List.of(
                wetDays + " dias com mais de " + WET_DAY_HOURS + " h de folha molhada",
                mildNights + " noites entre 20 e 28 °C")));
    }

    private static long count(List<DayWeather> days, Predicate<DayWeather> test) {
        return days.stream().filter(test).count();
    }

    private static long minTemp(List<DayWeather> f) {
        return Math.round(f.stream().filter(d -> d.minC() != null).mapToDouble(DayWeather::minC).min().orElse(0));
    }

    private static long maxTemp(List<DayWeather> f) {
        return Math.round(f.stream().filter(d -> d.maxC() != null).mapToDouble(DayWeather::maxC).max().orElse(0));
    }
}
