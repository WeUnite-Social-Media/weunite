package com.weunite.api.follow.repository;

import com.weunite.api.follow.domain.Follow;
import com.weunite.api.users.domain.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowRepository extends JpaRepository<Follow, Long> {

  @EntityGraph(attributePaths = {"follower", "followed"})
  Optional<Follow> findByFollowerIdAndFollowedId(Long followerId, Long followedId);

  @EntityGraph(attributePaths = {"follower", "followed"})
  Page<Follow> findAllByFollowedAndStatus(User user, Follow.FollowStatus status, Pageable pageable);

  @EntityGraph(attributePaths = {"follower", "followed"})
  Page<Follow> findAllByFollowerAndStatus(User user, Follow.FollowStatus status, Pageable pageable);

  long countByFollowedAndStatus(User user, Follow.FollowStatus status);

  long countByFollowerAndStatus(User user, Follow.FollowStatus status);
}
