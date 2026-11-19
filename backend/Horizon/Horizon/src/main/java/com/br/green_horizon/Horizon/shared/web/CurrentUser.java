package com.br.green_horizon.Horizon.shared.web;

/**
 * The logged-in user is identified by this header, set by the frontend's axios client from the
 * login response. This is not authentication: replace it with a signed token (JWT) before production.
 */
public final class CurrentUser {

    public static final String HEADER = "X-User-Id";

    private CurrentUser() {
    }
}
