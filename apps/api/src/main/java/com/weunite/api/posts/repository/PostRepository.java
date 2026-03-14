package com.weunite.api.posts.repository;

import com.weunite.api.posts.domain.Post;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PostRepository extends JpaRepository<Post, Long> {

  @Query("SELECT p FROM Post p ORDER BY COALESCE(p.updatedAt, p.createdAt) DESC")
  List<Post> findAllOrderedByCreationDate();
}
