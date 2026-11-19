package com.br.green_horizon.Horizon.shared.geo;

import java.util.List;

/**
 * Small geodesy helpers for points written as {@code [lat, lng]}, the same shape the frontend uses.
 * Planar approximations are accurate enough for fields and distances of a few kilometres.
 */
public final class Geo {

    private static final double EARTH_RADIUS_KM = 6371.0088;
    private static final double METERS_PER_DEG_LAT = 110_574;
    private static final double METERS_PER_DEG_LNG_EQUATOR = 111_320;
    private static final String[] DIRECTIONS = {
            "ao norte", "a nordeste", "a leste", "a sudeste", "ao sul", "a sudoeste", "a oeste", "a noroeste"
    };

    private Geo() {
    }

    public static double distanceKm(double[] a, double[] b) {
        double dLat = Math.toRadians(b[0] - a[0]);
        double dLng = Math.toRadians(b[1] - a[1]);
        double h = Math.pow(Math.sin(dLat / 2), 2)
                + Math.cos(Math.toRadians(a[0])) * Math.cos(Math.toRadians(b[0])) * Math.pow(Math.sin(dLng / 2), 2);
        return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
    }

    public static double areaHa(List<double[]> ring) {
        double[][] xy = project(ring);
        double twiceArea = 0;
        for (int i = 0; i < xy.length; i++) {
            double[] p = xy[i];
            double[] q = xy[(i + 1) % xy.length];
            twiceArea += p[0] * q[1] - q[0] * p[1];
        }
        return Math.abs(twiceArea) / 2 / 10_000;
    }

    public static double[] centroid(List<double[]> ring) {
        double lat = 0;
        double lng = 0;
        for (double[] p : ring) {
            lat += p[0];
            lng += p[1];
        }
        return new double[]{lat / ring.size(), lng / ring.size()};
    }

    public static boolean contains(List<double[]> ring, double[] point) {
        boolean inside = false;
        for (int i = 0, j = ring.size() - 1; i < ring.size(); j = i++) {
            double[] a = ring.get(i);
            double[] b = ring.get(j);
            boolean crosses = (a[0] > point[0]) != (b[0] > point[0])
                    && point[1] < (b[1] - a[1]) * (point[0] - a[0]) / (b[0] - a[0]) + a[1];
            if (crosses) {
                inside = !inside;
            }
        }
        return inside;
    }

    /** "a nordeste", "ao sul"... from {@code from} towards {@code to}. */
    public static String directionPhrase(double[] from, double[] to) {
        double north = (to[0] - from[0]) * METERS_PER_DEG_LAT;
        double east = (to[1] - from[1]) * metersPerDegLng(from[0]);
        double bearing = (Math.toDegrees(Math.atan2(east, north)) + 360) % 360;
        return DIRECTIONS[(int) Math.round(bearing / 45) % DIRECTIONS.length];
    }

    public static double round(double value, int digits) {
        double factor = Math.pow(10, digits);
        return Math.round(value * factor) / factor;
    }

    private static double[][] project(List<double[]> ring) {
        double lat0 = ring.get(0)[0];
        double[][] xy = new double[ring.size()][];
        for (int i = 0; i < ring.size(); i++) {
            double[] p = ring.get(i);
            xy[i] = new double[]{p[1] * metersPerDegLng(lat0), p[0] * METERS_PER_DEG_LAT};
        }
        return xy;
    }

    private static double metersPerDegLng(double lat) {
        return METERS_PER_DEG_LNG_EQUATOR * Math.cos(Math.toRadians(lat));
    }
}
