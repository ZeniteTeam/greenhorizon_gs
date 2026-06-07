package com.br.green_horizon.Horizon.user.infrastructure.repository;

import com.br.green_horizon.Horizon.user.application.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IUserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
