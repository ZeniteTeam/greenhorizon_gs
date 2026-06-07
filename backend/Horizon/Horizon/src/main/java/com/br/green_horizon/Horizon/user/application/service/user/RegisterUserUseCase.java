package com.br.green_horizon.Horizon.user.application.service.user;

import com.br.green_horizon.Horizon.user.application.entities.User;
import com.br.green_horizon.Horizon.user.data.request.RegisterRequest;
import com.br.green_horizon.Horizon.user.infrastructure.mapper.UserMapper;
import com.br.green_horizon.Horizon.user.infrastructure.repository.IUserRepository;
import org.springframework.stereotype.Service;

@Service
public class RegisterUserUseCase {

    private final IUserRepository userRepository;

    public RegisterUserUseCase(IUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email).isPresent()) {
            throw new IllegalArgumentException("Email já registrado");
        }

        User u = UserMapper.MapRequestToUser(request, new User());

        return userRepository.save(u);
    }

}
