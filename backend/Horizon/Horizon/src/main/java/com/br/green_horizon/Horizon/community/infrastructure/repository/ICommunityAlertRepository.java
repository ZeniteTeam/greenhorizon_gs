package com.br.green_horizon.Horizon.community.infrastructure.repository;

import com.br.green_horizon.Horizon.community.application.entities.CommunityAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ICommunityAlertRepository extends JpaRepository<CommunityAlert, Long> {
    List<CommunityAlert> findTop10ByUserIdOrderByCreatedAtDescIdDesc(Long userId);
}
