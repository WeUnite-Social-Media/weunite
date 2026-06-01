package com.weunite.api.follow.repository;

import com.weunite.api.follow.domain.Follow;
import com.weunite.api.users.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowRepository extends JpaRepository<Follow, Long> {

  Optional<Follow> findByFollowerIdAndFollowedId(Long followerId, Long followedId);

  List<Follow> findAllByFollowed(User user);

  List<Follow> findAllByFollower(User user);

  // Novos métodos para filtrar por status
  List<Follow> findAllByFollowedAndStatus(User user, Follow.FollowStatus status);

  List<Follow> findAllByFollowerAndStatus(User user, Follow.FollowStatus status);

  Page<Follow> findAllByFollowedAndStatus(User user, Follow.FollowStatus status, Pageable pageable);

  Page<Follow> findAllByFollowerAndStatus(User user, Follow.FollowStatus status, Pageable pageable);

  long countByFollowedAndStatus(User user, Follow.FollowStatus status);

  long countByFollowerAndStatus(User user, Follow.FollowStatus status);
}
