package com.example.weuniteauth.repository;

import com.example.weuniteauth.domain.users.Follow;
import com.example.weuniteauth.domain.users.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow,Long> {

    Optional<Follow> findByFollowerIdAndFollowedId(Long followerId, Long followedId);

    List<Follow> findAllByFollowed(User user);

    List<Follow> findAllByFollower(User user);

    // Novos métodos para filtrar por status
    List<Follow> findAllByFollowedAndStatus(User user, Follow.FollowStatus status);

    List<Follow> findAllByFollowerAndStatus(User user, Follow.FollowStatus status);
}
