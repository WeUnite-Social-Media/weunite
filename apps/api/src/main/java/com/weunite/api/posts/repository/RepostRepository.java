package com.weunite.api.posts.repository;

import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.domain.Repost;
import com.weunite.api.users.domain.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RepostRepository extends JpaRepository<Repost, Long> {

  Optional<Repost> findByUserAndPost(User user, Post post);

  @Query(
      value = "SELECT r FROM Repost r WHERE r.post.deleted = false ORDER BY r.createdAt DESC",
      countQuery = "SELECT COUNT(r) FROM Repost r WHERE r.post.deleted = false")
  Page<Repost> findFeedReposts(Pageable pageable);

  @Query(
      value =
          "SELECT r FROM Repost r WHERE r.user.id = :userId AND r.post.deleted = false ORDER BY r.createdAt DESC",
      countQuery =
          "SELECT COUNT(r) FROM Repost r WHERE r.user.id = :userId AND r.post.deleted = false")
  Page<Repost> findByUserId(@Param("userId") Long userId, Pageable pageable);
}
