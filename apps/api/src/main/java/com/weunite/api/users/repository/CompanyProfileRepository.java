package com.weunite.api.users.repository;

import com.weunite.api.users.domain.CompanyProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, Long> {}
