package com.weunite.api.users.repository;

import com.weunite.api.users.domain.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> {}
