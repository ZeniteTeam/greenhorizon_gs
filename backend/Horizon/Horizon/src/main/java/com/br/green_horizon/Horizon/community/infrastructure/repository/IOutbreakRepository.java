package com.br.green_horizon.Horizon.community.infrastructure.repository;

import com.br.green_horizon.Horizon.community.application.entities.Outbreak;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IOutbreakRepository extends JpaRepository<Outbreak, String> {
    List<Outbreak> findByStatus(String status);
}
