package com.weunite.api.posts.repository;

import com.weunite.api.posts.domain.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

  @Query(
      value = "SELECT p FROM Post p ORDER BY COALESCE(p.updatedAt, p.createdAt) DESC",
      countQuery = "SELECT COUNT(p) FROM Post p")
  Page<Post> findFeedPosts(Pageable pageable);

  @Query(
      value =
          "SELECT p FROM Post p WHERE p.user.id = :userId"
              + " ORDER BY COALESCE(p.updatedAt, p.createdAt) DESC",
      countQuery = "SELECT COUNT(p) FROM Post p WHERE p.user.id = :userId")
  Page<Post> findPostsByUserId(@Param("userId") Long userId, Pageable pageable);
}
