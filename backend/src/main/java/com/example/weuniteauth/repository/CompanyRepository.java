package com.example.weuniteauth.repository;

import com.example.weuniteauth.domain.users.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> {
}
