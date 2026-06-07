package com.br.green_horizon.Horizon.user.infrastructure.mapper;

import com.br.green_horizon.Horizon.user.application.entities.User;
import com.br.green_horizon.Horizon.user.data.request.RegisterRequest;
import com.br.green_horizon.Horizon.user.data.response.AuthResponse;

public class UserMapper {

    public static User MapRequestToUser(RegisterRequest request, User user) {
        user.setUsername(request.username);
        user.setEmail(request.email);
        user.setPassword(request.password);
        return user;
    }
}
