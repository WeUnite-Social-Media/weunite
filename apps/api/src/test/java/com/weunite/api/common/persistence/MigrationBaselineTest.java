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

  @Test
  @DisplayName("Should create relationship query indexes from Flyway migrations")
  void createRelationshipQueryIndexes() {
    Set<String> followIndexNames = getIndexNames("FOLLOW");
    Set<String> subscriberIndexNames = getIndexNames("SUBSCRIBER");
    Set<String> savedOpportunityIndexNames = getIndexNames("SAVED_OPPORTUNITIES");
    Set<String> likeIndexNames = getIndexNames("TB_POST_LIKE");

    org.junit.jupiter.api.Assertions.assertTrue(
        followIndexNames.containsAll(
            Set.of("IDX_FOLLOW_FOLLOWED_STATUS", "IDX_FOLLOW_FOLLOWER_STATUS")));
    org.junit.jupiter.api.Assertions.assertTrue(
        subscriberIndexNames.contains("IDX_SUBSCRIBER_OPPORTUNITY_ID"));
    org.junit.jupiter.api.Assertions.assertTrue(
        savedOpportunityIndexNames.contains("IDX_SAVED_OPPORTUNITIES_ATHLETE_SAVED_AT"));
    org.junit.jupiter.api.Assertions.assertTrue(
        likeIndexNames.contains("IDX_POST_LIKE_COMMENT_ID"));
  }

  @Test
  @DisplayName("Should create athlete and company profile tables for the split migration")
  void createProfileTables() {
    Set<String> tableNames =
        Set.copyOf(
            jdbcTemplate.queryForList(
                "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'PUBLIC'",
                String.class));

    org.junit.jupiter.api.Assertions.assertTrue(tableNames.contains("ATHLETE_PROFILE"));
    org.junit.jupiter.api.Assertions.assertTrue(tableNames.contains("COMPANY_PROFILE"));
  }

  private Set<String> getIndexNames(String tableName) {
    return Set.copyOf(
        jdbcTemplate.queryForList(
            "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.INDEXES WHERE TABLE_NAME = ?",
            String.class,
            tableName));
  }
}
