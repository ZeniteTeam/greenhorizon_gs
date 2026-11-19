package com.br.green_horizon.Horizon.shared.format;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/** Number and date formatting for user-facing Portuguese text. */
public final class PtBr {

    private static final Locale LOCALE = Locale.forLanguageTag("pt-BR");
    private static final DateTimeFormatter DAY_MONTH = DateTimeFormatter.ofPattern("dd/MM");

    private PtBr() {
    }

    public static String number(double value, int digits) {
        NumberFormat format = NumberFormat.getNumberInstance(LOCALE);
        format.setMinimumFractionDigits(digits);
        format.setMaximumFractionDigits(digits);
        return format.format(value);
    }

    public static String signed(double value, int digits) {
        String formatted = number(Math.abs(value), digits);
        if (value > 0) return "+" + formatted;
        if (value < 0) return "−" + formatted;
        return formatted;
    }

    public static String dayMonth(LocalDate date) {
        return date.format(DAY_MONTH);
    }
}
