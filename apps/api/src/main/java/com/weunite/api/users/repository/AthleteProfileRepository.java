package com.weunite.api.users.repository;

import com.weunite.api.users.domain.AthleteProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AthleteProfileRepository extends JpaRepository<AthleteProfile, Long> {}
