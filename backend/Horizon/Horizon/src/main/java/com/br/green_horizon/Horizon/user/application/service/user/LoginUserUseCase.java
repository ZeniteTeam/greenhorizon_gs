package com.br.green_horizon.Horizon.user.application.service.user;

import com.br.green_horizon.Horizon.user.application.entities.User;
import com.br.green_horizon.Horizon.user.data.request.AuthRequest;
import com.br.green_horizon.Horizon.user.data.request.RegisterRequest;
import com.br.green_horizon.Horizon.user.infrastructure.repository.IUserRepository;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class LoginUserUseCase {
    private final IUserRepository userRepository;

    public LoginUserUseCase(IUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean authenticate(AuthRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .map(u -> Objects.equals(request.getPassword(), u.getPassword()))
                .orElse(false);
    }

}
