package com.example.weuniteauth.repository;

import com.example.weuniteauth.domain.users.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface  RoleRepository extends JpaRepository<Role, Long> {
    Role findByName(String name);
    
}
