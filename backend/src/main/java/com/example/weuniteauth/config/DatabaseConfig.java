package com.example.weuniteauth.config;

import com.example.weuniteauth.domain.users.Role;
import com.example.weuniteauth.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseConfig {

    @Bean
    CommandLineRunner initDatabase(RoleRepository roleRepository) {
        return args -> {

            if (roleRepository.findByName(Role.Values.BASIC.name()) == null) {
                Role basicRole = new Role();
                basicRole.setName(Role.Values.BASIC.name());
                roleRepository.save(basicRole);
            }

            if (roleRepository.findByName(Role.Values.ADMIN.name()) == null) {
                Role adminRole = new Role();
                adminRole.setName(Role.Values.ADMIN.name());
                roleRepository.save(adminRole);
            }

            if (roleRepository.findByName(Role.Values.COMPANY.name()) == null) {
                Role companyRole = new Role();
                companyRole.setName("COMPANY");
                roleRepository.save(companyRole);
            }

            if (roleRepository.findByName(Role.Values.ATHLETE.name()) == null) {
                Role athleteRole = new Role();
                athleteRole.setName("ATHLETE");
                roleRepository.save(athleteRole);
            }

            if (roleRepository.findByName(Role.Values.ATHLETE.name()) == null) {
                Role adminRole = new Role();
                adminRole.setName("ADMIN");
                roleRepository.save(adminRole);
            }
        };
    }
}

