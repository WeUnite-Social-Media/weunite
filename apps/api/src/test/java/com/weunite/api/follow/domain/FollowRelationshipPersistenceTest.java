package com.weunite.api.follow.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.weunite.api.follow.repository.FollowRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

@DataJpaTest
class FollowRelationshipPersistenceTest {

  @Autowired private UserRepository userRepository;

  @Autowired private FollowRepository followRepository;

  @Autowired private EntityManager entityManager;

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

  @Test
  @DisplayName("Should keep follow lifecycle repository-owned when user collections change")
  void keepFollowLifecycleRepositoryOwned() {
    User follower =
        userRepository.save(new User("Follower Two", "follower_two", "f2@example.com", "p"));
    User followed =
        userRepository.save(new User("Followed Two", "followed_two", "d2@example.com", "p"));
    followRepository.saveAndFlush(new Follow(follower, followed));

    entityManager.clear();

    User reloadedFollower = userRepository.findById(follower.getId()).orElseThrow();
    reloadedFollower.getFollowing().clear();
    userRepository.saveAndFlush(reloadedFollower);

    entityManager.clear();

    assertEquals(1, followRepository.count());
  }
}
