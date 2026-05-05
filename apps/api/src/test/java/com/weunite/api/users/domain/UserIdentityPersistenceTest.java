package com.weunite.api.users.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.weunite.api.users.repository.RoleRepository;
import com.weunite.api.users.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

@DataJpaTest
class UserIdentityPersistenceTest {

  @Autowired private UserRepository userRepository;

  @Autowired private RoleRepository roleRepository;

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
}
