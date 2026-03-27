package com.weunite.api.common.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class DatabaseConfigTest {

  private static final String LEGACY_USERNAME = "legacy-user-bootstrap";

  @Autowired private DatabaseConfig databaseConfig;

  @Autowired private JdbcTemplate jdbcTemplate;

  @Autowired private UserRepository userRepository;

  @Test
  @DisplayName("Should normalize legacy null user booleans before loading users")
  void normalizeLegacyUserBooleansBeforeLoadingUsers() {
    relaxUserBooleanConstraints();

    jdbcTemplate.execute(
        """
        INSERT INTO tb_user (
          dtype,
          created_at,
          name,
          username,
          email,
          password,
          email_verified,
          is_banned,
          is_suspended,
          is_private
        ) VALUES (
          'USER',
          CURRENT_TIMESTAMP,
          'Legacy User',
          'legacy-user-bootstrap',
          'legacy-user-bootstrap@example.com',
          'encoded-password',
          NULL,
          NULL,
          NULL,
          NULL
        )
        """);

    databaseConfig.normalizeLegacyUserBooleans(jdbcTemplate);

    User user = userRepository.findByUsername(LEGACY_USERNAME).orElseThrow();

    assertFalse(user.isEmailVerified());
    assertFalse(user.isBanned());
    assertFalse(user.isSuspended());
    assertFalse(user.isPrivate());
    assertEquals(Boolean.FALSE, readBooleanColumn("email_verified"));
    assertEquals(Boolean.FALSE, readBooleanColumn("is_banned"));
    assertEquals(Boolean.FALSE, readBooleanColumn("is_suspended"));
    assertEquals(Boolean.FALSE, readBooleanColumn("is_private"));
  }

  private Boolean readBooleanColumn(String columnName) {
    return jdbcTemplate.queryForObject(
        "SELECT " + columnName + " FROM tb_user WHERE username = ?",
        Boolean.class,
        LEGACY_USERNAME);
  }

  private void relaxUserBooleanConstraints() {
    dropNotNullConstraint("email_verified");
    dropNotNullConstraint("is_banned");
    dropNotNullConstraint("is_suspended");
    dropNotNullConstraint("is_private");
  }

  private void dropNotNullConstraint(String columnName) {
    try {
      jdbcTemplate.execute("ALTER TABLE tb_user ALTER COLUMN " + columnName + " DROP NOT NULL");
    } catch (DataAccessException ignored) {
      jdbcTemplate.execute("ALTER TABLE tb_user ALTER COLUMN " + columnName + " SET NULL");
    }
  }
}
