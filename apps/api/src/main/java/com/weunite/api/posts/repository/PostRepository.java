package com.weunite.api.posts.repository;

import com.weunite.api.posts.domain.Post;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

  @Query(
      value =
          "SELECT p FROM Post p WHERE p.deleted = false ORDER BY COALESCE(p.updatedAt, p.createdAt) DESC",
      countQuery = "SELECT COUNT(p) FROM Post p WHERE p.deleted = false")
  Page<Post> findFeedPosts(Pageable pageable);

  @Query(
      value =
          "SELECT p FROM Post p WHERE p.user.id = :userId AND p.deleted = false"
              + " ORDER BY COALESCE(p.updatedAt, p.createdAt) DESC",
      countQuery = "SELECT COUNT(p) FROM Post p WHERE p.user.id = :userId AND p.deleted = false")
  Page<Post> findPostsByUserId(@Param("userId") Long userId, Pageable pageable);

  @Query("SELECT COUNT(l) FROM Like l WHERE l.post IS NOT NULL")
  Long countTotalLikes();

  @Query("SELECT COUNT(c) FROM Comment c")
  Long countTotalComments();

  @Query("SELECT COUNT(p) FROM Post p WHERE p.createdAt BETWEEN :startDate AND :endDate")
  Long countPostsBetweenDates(
      @Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
}
