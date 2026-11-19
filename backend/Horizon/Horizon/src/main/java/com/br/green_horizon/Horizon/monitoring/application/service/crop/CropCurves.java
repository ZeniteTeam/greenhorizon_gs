package com.br.green_horizon.Horizon.monitoring.application.service.crop;

import com.br.green_horizon.Horizon.monitoring.application.enums.Crop;
import com.br.green_horizon.Horizon.shared.geo.Geo;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Expected NDVI curve and growth stages per crop: a logistic rise followed by a linear decline
 * after senescence starts. Same parameters as the frontend demo (src/mocks/season.ts).
 */
public final class CropCurves {

    public static final int REVISIT_DAYS = 5;
    private static final double MAX_EXPECTED_NDVI = 0.95;

    public record Curve(double base, double peak, double riseMid, double riseRate, int senescenceStart,
                        double senescenceRate, double band, int seasonLengthDays, List<Stage> stages) {
    }

    public record Stage(int untilDap, String label) {
    }

    public record ExpectedPoint(int dap, double low, double high) {
    }

    private static final Map<Crop, Curve> CURVES = Map.of(
            Crop.Soja, new Curve(0.18, 0.86, 33, 7, 95, 0.02, 0.07, 120, List.of(
                    new Stage(10, "VE · emergência"), new Stage(20, "V2 · 2º trifólio"), new Stage(30, "V4 · 4º trifólio"),
                    new Stage(40, "V6 · vegetativo"), new Stage(50, "R1 · início da floração"), new Stage(58, "R2 · floração plena"),
                    new Stage(72, "R3 · início das vagens"), new Stage(85, "R4 · vagem completa"), new Stage(98, "R5 · enchimento de grãos"),
                    new Stage(108, "R6 · grão cheio"), new Stage(999, "R7 · maturação"))),
            Crop.Milho, new Curve(0.2, 0.82, 30, 6, 85, 0.022, 0.07, 125, List.of(
                    new Stage(10, "VE · emergência"), new Stage(25, "V4 · 4 folhas"), new Stage(40, "V8 · 8 folhas"),
                    new Stage(55, "V12 · 12 folhas"), new Stage(65, "VT · pendoamento"), new Stage(75, "R1 · embonecamento"),
                    new Stage(90, "R3 · grão leitoso"), new Stage(105, "R5 · grão farináceo"), new Stage(999, "R6 · maturação"))),
            Crop.Arroz, new Curve(0.22, 0.84, 35, 7, 95, 0.02, 0.07, 120, List.of(
                    new Stage(15, "V1 · emergência"), new Stage(45, "V6 · perfilhamento"), new Stage(70, "R2 · emborrachamento"),
                    new Stage(85, "R4 · floração"), new Stage(100, "R6 · enchimento"), new Stage(999, "R9 · maturação")))
    );

    private CropCurves() {
    }

    public static Curve of(Crop crop) {
        return CURVES.get(crop);
    }

    public static double expectedMid(Crop crop, int dap) {
        Curve c = of(crop);
        if (dap <= c.senescenceStart()) {
            return rise(c, dap);
        }
        return rise(c, c.senescenceStart()) - c.senescenceRate() * (dap - c.senescenceStart());
    }

    public static String stageAt(Crop crop, int dap) {
        List<Stage> stages = of(crop).stages();
        return stages.stream()
                .filter(s -> dap <= s.untilDap())
                .findFirst()
                .orElse(stages.get(stages.size() - 1))
                .label();
    }

    public static boolean isSenescing(Crop crop, int dap) {
        return dap >= of(crop).senescenceStart();
    }

    public static List<ExpectedPoint> expected(Crop crop) {
        Curve c = of(crop);
        List<ExpectedPoint> points = new ArrayList<>();
        for (int dap = 0; dap <= c.seasonLengthDays(); dap += REVISIT_DAYS) {
            double mid = expectedMid(crop, dap);
            points.add(new ExpectedPoint(dap, Geo.round(mid - c.band(), 3),
                    Geo.round(Math.min(MAX_EXPECTED_NDVI, mid + c.band()), 3)));
        }
        return points;
    }

    public static ExpectedPoint expectedAt(Crop crop, int dap) {
        return expected(crop).stream()
                .min((a, b) -> Integer.compare(Math.abs(a.dap() - dap), Math.abs(b.dap() - dap)))
                .orElseThrow();
    }

    private static double rise(Curve c, double dap) {
        return c.base() + (c.peak() - c.base()) / (1 + Math.exp(-(dap - c.riseMid()) / c.riseRate()));
    }
}
