package com.weunite.api.common.config;

import com.weunite.api.users.domain.Role;
import com.weunite.api.users.repository.RoleRepository;
import java.util.List;
import java.util.Locale;
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

    ColumnDefinition columnDefinition = loadColumnDefinition(jdbcTemplate, columnName);
    if (!columnDefinition.hasFalseDefault()) {
      jdbcTemplate.execute("ALTER TABLE tb_user ALTER COLUMN " + columnName + " SET DEFAULT FALSE");
    }
    if (columnDefinition.nullable()) {
      jdbcTemplate.execute("ALTER TABLE tb_user ALTER COLUMN " + columnName + " SET NOT NULL");
    }
  }

  private ColumnDefinition loadColumnDefinition(JdbcTemplate jdbcTemplate, String columnName) {
    return jdbcTemplate.query(
        """
        SELECT is_nullable, column_default
        FROM information_schema.columns
        WHERE UPPER(table_name) = 'TB_USER'
          AND UPPER(column_name) = ?
        ORDER BY CASE WHEN UPPER(table_schema) = 'PUBLIC' THEN 0 ELSE 1 END
        LIMIT 1
        """,
        resultSet -> {
          if (!resultSet.next()) {
            return new ColumnDefinition(true, false);
          }

          boolean nullable = "YES".equalsIgnoreCase(resultSet.getString("is_nullable"));
          String columnDefault = resultSet.getString("column_default");
          boolean hasFalseDefault =
              columnDefault != null && columnDefault.toLowerCase(Locale.ROOT).contains("false");

          return new ColumnDefinition(nullable, hasFalseDefault);
        },
        columnName.toUpperCase(Locale.ROOT));
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

  private record ColumnDefinition(boolean nullable, boolean hasFalseDefault) {}
}
