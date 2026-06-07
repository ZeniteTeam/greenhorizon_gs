package com.br.green_horizon.Horizon.user.application.service.user;

import com.br.green_horizon.Horizon.user.application.entities.User;
import com.br.green_horizon.Horizon.user.data.request.AuthRequest;
import com.br.green_horizon.Horizon.user.data.response.AuthResponse;
import com.br.green_horizon.Horizon.user.infrastructure.repository.IUserRepository;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class LoginUserUseCase {
    private final IUserRepository userRepository;

    public LoginUserUseCase(IUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse authenticate(AuthRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("Usuário ou senha inválidos"));

        if (!Objects.equals(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Usuário ou senha inválidos");
        }

        return new AuthResponse(user.getUsername(), user.getEmail());
    }



}
