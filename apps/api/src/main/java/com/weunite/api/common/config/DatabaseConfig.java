package com.weunite.api.common.config;

import com.weunite.api.users.domain.Role;
import com.weunite.api.users.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseConfig {

  @Bean
  CommandLineRunner initDatabase(RoleRepository roleRepository) {
    return args -> {
      for (Role.Values roleValue : Role.Values.values()) {
        if (roleRepository.findByName(roleValue.name()) == null) {
          Role role = new Role();
          role.setName(roleValue.name());
          roleRepository.save(role);
        }
      }
    };
  }
}
