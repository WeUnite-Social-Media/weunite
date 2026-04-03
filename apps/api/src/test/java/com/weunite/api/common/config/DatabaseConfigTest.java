package com.weunite.api.common.config;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
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

  @Autowired private JdbcTemplate jdbcTemplate;

  @Autowired private UserRepository userRepository;

  @Test
  @DisplayName("Should load legacy users with null boolean flags as disabled")
  void loadLegacyUserWithNullBooleanFlags() {
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

    User user =
        assertDoesNotThrow(() -> userRepository.findByUsername(LEGACY_USERNAME).orElseThrow());

    assertFalse(user.isEmailVerified());
    assertFalse(user.isBanned());
    assertFalse(user.isSuspended());
    assertFalse(user.isPrivate());
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
