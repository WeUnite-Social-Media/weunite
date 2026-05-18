package com.weunite.api.common.persistence;

import com.weunite.api.users.repository.RoleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:migration-baseline;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
      "spring.flyway.enabled=true",
      "spring.jpa.hibernate.ddl-auto=validate"
    })
class MigrationBaselineTest {

  @Autowired private RoleRepository roleRepository;

  @Test
  @DisplayName("Should build a schema Hibernate can validate from the Flyway baseline")
  void validateBaselineSchema() {
    roleRepository.findByName("BASIC");
  }
}
