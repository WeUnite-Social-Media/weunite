package com.weunite.api.chat.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.weunite.api.chat.repository.UserPresenceRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class UserPresencePersistenceTest {

  @Autowired private UserPresenceRepository userPresenceRepository;

  @Test
  @DisplayName("Should persist user status as domain enum while exposing string value")
  void persistUserStatus() {
    userPresenceRepository.saveAndFlush(new UserPresence(7L, UserStatus.ONLINE));

    UserPresence presence = userPresenceRepository.findById(7L).orElseThrow();

    assertEquals(UserStatus.ONLINE, presence.getStatus());
    assertEquals("ONLINE", presence.getStatusValue());
    assertNotNull(presence.getUpdatedAt());
  }
}
