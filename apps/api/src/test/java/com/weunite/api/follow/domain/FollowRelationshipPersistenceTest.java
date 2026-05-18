package com.weunite.api.follow.domain;

import static org.junit.jupiter.api.Assertions.assertThrows;

import com.weunite.api.follow.repository.FollowRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

@DataJpaTest
class FollowRelationshipPersistenceTest {

  @Autowired private UserRepository userRepository;

  @Autowired private FollowRepository followRepository;

  @Test
  @DisplayName("Should enforce one follow relationship per follower and followed pair")
  void enforceUniqueFollowRelationship() {
    User follower = userRepository.save(new User("Follower", "follower", "f@example.com", "p"));
    User followed = userRepository.save(new User("Followed", "followed", "d@example.com", "p"));

    followRepository.saveAndFlush(new Follow(follower, followed));

    assertThrows(
        DataIntegrityViolationException.class,
        () -> followRepository.saveAndFlush(new Follow(follower, followed)));
  }
}
