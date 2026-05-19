package com.weunite.api.users.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.weunite.api.users.repository.RoleRepository;
import com.weunite.api.users.repository.UserRepository;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class UserIdentityPersistenceTest {

  @Autowired private UserRepository userRepository;

  @Autowired private RoleRepository roleRepository;

  @Autowired private EntityManager entityManager;

  @Test
  @DisplayName("Should persist user credentials through explicit account credentials")
  void persistAccountCredentials() {
    User user = new User("Identity User", "identity_user", "Identity@Example.com", "encoded");
    user.setVerificationToken("123456");

    User savedUser = userRepository.saveAndFlush(user);

    User reloadedUser = userRepository.findByEmail("identity@example.com").orElseThrow();

    assertEquals(savedUser.getId(), reloadedUser.getId());
    assertNotNull(reloadedUser.getAccountCredentials());
    assertEquals("identity@example.com", reloadedUser.getAccountCredentials().getEmailValue());
    assertEquals("encoded", reloadedUser.getAccountCredentials().getPassword());
    assertEquals("123456", reloadedUser.getAccountCredentials().getVerificationToken());
    assertFalse(reloadedUser.isEmailVerified());
  }

  @Test
  @DisplayName("Should enforce unique role names")
  void enforceUniqueRoleNames() {
    roleRepository.saveAndFlush(new Role(null, "ATHLETE"));

    assertThrows(
        DataIntegrityViolationException.class,
        () -> roleRepository.saveAndFlush(new Role(null, "ATHLETE")));
  }

  @Test
  @DisplayName("Should persist athlete profile through explicit profile table")
  void persistAthleteProfile() {
    Athlete athlete =
        new Athlete("Profile Athlete", "profile_athlete", "profile-athlete@example.com", "p");
    athlete.setCPF("12345678901");
    athlete.setHeight(1.83);
    athlete.setWeight(79.5);
    athlete.setFootDomain("RIGHT");
    athlete.setPosition("FORWARD");
    athlete.setBirthDate(LocalDate.of(2000, 1, 2));

    Athlete savedAthlete = userRepository.saveAndFlush(athlete);

    entityManager.clear();

    Athlete reloadedAthlete = (Athlete) userRepository.findById(savedAthlete.getId()).orElseThrow();

    assertNotNull(reloadedAthlete.getProfile());
    assertEquals(savedAthlete.getId(), reloadedAthlete.getProfile().getUserId());
    assertEquals("12345678901", reloadedAthlete.getProfile().getCPF());
    assertEquals(1.83, reloadedAthlete.getProfile().getHeight());
    assertEquals(79.5, reloadedAthlete.getProfile().getWeight());
    assertEquals("RIGHT", reloadedAthlete.getProfile().getFootDomain());
    assertEquals("FORWARD", reloadedAthlete.getProfile().getPosition());
    assertEquals(LocalDate.of(2000, 1, 2), reloadedAthlete.getProfile().getBirthDate());
  }

  @Test
  @DisplayName("Should persist company profile through explicit profile table")
  void persistCompanyProfile() {
    Company company =
        new Company("Profile Company", "profile_company", "profile-company@example.com", "p");
    company.setCNPJ("12345678000199");

    Company savedCompany = userRepository.saveAndFlush(company);

    entityManager.clear();

    Company reloadedCompany = (Company) userRepository.findById(savedCompany.getId()).orElseThrow();

    assertNotNull(reloadedCompany.getProfile());
    assertEquals(savedCompany.getId(), reloadedCompany.getProfile().getUserId());
    assertEquals("12345678000199", reloadedCompany.getProfile().getCNPJ());
  }

  @Test
  @DisplayName("Should fetch athlete profile with role-owned user read model")
  void fetchAthleteProfileWithUserReadModel() {
    Athlete athlete =
        new Athlete(
            "Fetched Profile Athlete",
            "fetched_profile_athlete",
            "fetched-profile-athlete@example.com",
            "p");
    athlete.setHeight(1.84);
    athlete.setWeight(80.5);

    userRepository.saveAndFlush(athlete);

    entityManager.clear();

    Athlete reloadedAthlete =
        (Athlete) userRepository.findByUsernameWithRoles("fetched_profile_athlete").orElseThrow();

    assertTrue(
        entityManager
            .getEntityManagerFactory()
            .getPersistenceUnitUtil()
            .isLoaded(reloadedAthlete, "profile"));
    assertNotNull(reloadedAthlete.getProfile());
    assertEquals(1.84, reloadedAthlete.getProfile().getHeight());
    assertEquals(80.5, reloadedAthlete.getProfile().getWeight());
  }

  @Test
  @DisplayName("Should fetch company profile with role-owned user read model")
  void fetchCompanyProfileWithUserReadModel() {
    Company company =
        new Company(
            "Fetched Profile Company",
            "fetched_profile_company",
            "fetched-profile-company@example.com",
            "p");
    company.setCNPJ("12345678000199");

    userRepository.saveAndFlush(company);

    entityManager.clear();

    Company reloadedCompany =
        (Company) userRepository.findByUsernameWithRoles("fetched_profile_company").orElseThrow();

    assertTrue(
        entityManager
            .getEntityManagerFactory()
            .getPersistenceUnitUtil()
            .isLoaded(reloadedCompany, "profile"));
    assertNotNull(reloadedCompany.getProfile());
    assertEquals("12345678000199", reloadedCompany.getProfile().getCNPJ());
  }
}
