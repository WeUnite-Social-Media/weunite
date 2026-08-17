package com.weunite.api.common.persistence;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

class UserProfileSplitMigrationTest {

  @Test
  @DisplayName("Should backfill athlete and company profiles from the legacy user table")
  void backfillProfileTables() {
    DriverManagerDataSource dataSource =
        new DriverManagerDataSource(
            "jdbc:h2:mem:user-profile-split;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
            "sa",
            "");
    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    Flyway.configure()
        .dataSource(dataSource)
        .locations("classpath:db/migration")
        .target("3")
        .load()
        .migrate();

    jdbcTemplate.update(
        """
        insert into tb_user (
          dtype, created_at, name, username, email, password, email_verified,
          is_banned, is_suspended, is_private, cpf, height, weight,
          foot_domain, position, birth_date
        ) values (
          'ATHLETE', current_timestamp, 'Athlete', 'athlete_profile',
          'athlete@example.com', 'encoded', false, false, false, false,
          '12345678901', 1.82, 78.5, 'RIGHT', 'FORWARD', date '2000-01-02'
        )
        """);
    jdbcTemplate.update(
        """
        insert into tb_user (
          dtype, created_at, name, username, email, password, email_verified,
          is_banned, is_suspended, is_private, cnpj
        ) values (
          'COMPANY', current_timestamp, 'Company', 'company_profile',
          'company@example.com', 'encoded', false, false, false, false,
          '12345678000199'
        )
        """);

    Flyway.configure().dataSource(dataSource).locations("classpath:db/migration").load().migrate();

    assertEquals(
        1, jdbcTemplate.queryForObject("select count(*) from athlete_profile", Integer.class));
    assertEquals(
        "12345678901",
        jdbcTemplate.queryForObject("select cpf from athlete_profile", String.class));
    assertEquals(
        1, jdbcTemplate.queryForObject("select count(*) from company_profile", Integer.class));
    assertEquals(
        "12345678000199",
        jdbcTemplate.queryForObject("select cnpj from company_profile", String.class));
    assertThrows(
        DataAccessException.class,
        () -> jdbcTemplate.queryForObject("select cnpj from tb_user", String.class));
    assertThrows(
        DataAccessException.class,
        () -> jdbcTemplate.queryForObject("select cpf from tb_user", String.class));
  }
}
