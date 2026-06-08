package com.br.green_horizon.Horizon.user.application.facade;

import com.br.green_horizon.Horizon.user.application.service.user.LoginUserUseCase;
import com.br.green_horizon.Horizon.user.application.service.user.RegisterUserUseCase;
import com.br.green_horizon.Horizon.user.data.request.AuthRequest;
import com.br.green_horizon.Horizon.user.data.request.RegisterRequest;
import com.br.green_horizon.Horizon.user.data.response.AuthResponse;

public class UserFacade {
    private final LoginUserUseCase loginUserUseCase;
    private final RegisterUserUseCase registerUserUseCase;

    public UserFacade(LoginUserUseCase loginUserUseCase, RegisterUserUseCase registerUserUseCase) {
        this.loginUserUseCase = loginUserUseCase;
        this.registerUserUseCase = registerUserUseCase;
    }

    public AuthResponse Login(AuthRequest request) {
        return loginUserUseCase.authenticate(request);
    }

    public Boolean Register(RegisterRequest request) {
        return registerUserUseCase.register(request);
    }
}
