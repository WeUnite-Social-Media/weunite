package com.weunite.api.common.config;

import com.weunite.api.users.domain.Role;
import com.weunite.api.users.repository.RoleRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseConfig {

  private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);
  private static final List<String> USER_BOOLEAN_COLUMNS =
      List.of("email_verified", "is_banned", "is_suspended", "is_private");

  @Bean
  CommandLineRunner initDatabase(JdbcTemplate jdbcTemplate, RoleRepository roleRepository) {
    return args -> {
      normalizeLegacyUserBooleans(jdbcTemplate);
      seedRoles(roleRepository);
    };
  }

  void normalizeLegacyUserBooleans(JdbcTemplate jdbcTemplate) {
    USER_BOOLEAN_COLUMNS.forEach(
        columnName -> normalizeUserBooleanColumn(jdbcTemplate, columnName));
  }

  private void normalizeUserBooleanColumn(JdbcTemplate jdbcTemplate, String columnName) {
    int normalizedRows =
        jdbcTemplate.update(
            "UPDATE tb_user SET " + columnName + " = FALSE WHERE " + columnName + " IS NULL");

    if (normalizedRows > 0) {
      logger.warn("Normalized {} legacy tb_user rows with NULL {}.", normalizedRows, columnName);
    }

    jdbcTemplate.execute("ALTER TABLE tb_user ALTER COLUMN " + columnName + " SET DEFAULT FALSE");
    jdbcTemplate.execute("ALTER TABLE tb_user ALTER COLUMN " + columnName + " SET NOT NULL");
  }

  private void seedRoles(RoleRepository roleRepository) {
    for (Role.Values roleValue : Role.Values.values()) {
      if (roleRepository.findByName(roleValue.name()) == null) {
        Role role = new Role();
        role.setName(roleValue.name());
        roleRepository.save(role);
      }
    }
  }
}
