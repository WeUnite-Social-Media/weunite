package com.weunite.api.users.repository;

import com.weunite.api.users.domain.Athlete;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AthleteRepository extends JpaRepository<Athlete, Long> {}
