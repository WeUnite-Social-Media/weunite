package com.weunite.api.common.persistence;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.weunite.api.users.domain.Role;
import com.weunite.api.users.repository.RoleRepository;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:migration-baseline;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
      "spring.flyway.enabled=true",
      "spring.jpa.hibernate.ddl-auto=validate"
    })
class MigrationBaselineTest {

  @Autowired private RoleRepository roleRepository;

  @Autowired private JdbcTemplate jdbcTemplate;

  @Test
  @DisplayName("Should build a schema Hibernate can validate from the Flyway baseline")
  void validateBaselineSchema() {
    for (Role.Values role : Role.Values.values()) {
      assertNotNull(roleRepository.findByName(role.name()));
    }
  }

  @Test
  @DisplayName("Should create notification indexes from Flyway migrations")
  void createNotificationIndexes() {
    Set<String> indexNames =
        Set.copyOf(
            jdbcTemplate.queryForList(
                "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.INDEXES WHERE TABLE_NAME = 'TB_NOTIFICATION'",
                String.class));

    assertNotNull(indexNames);
    org.junit.jupiter.api.Assertions.assertTrue(
        indexNames.containsAll(
            Set.of(
                "IDX_NOTIFICATION_USER_CREATED_AT",
                "IDX_NOTIFICATION_USER_READ",
                "IDX_NOTIFICATION_TYPE",
                "IDX_NOTIFICATION_ACTOR_ID",
                "IDX_NOTIFICATION_RELATED_ENTITY_ID")));
  }
}
