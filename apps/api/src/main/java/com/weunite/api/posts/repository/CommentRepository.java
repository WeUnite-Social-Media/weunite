package com.weunite.api.posts.repository;

import com.weunite.api.posts.domain.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CommentRepository extends JpaRepository<Comment, Long> {

  List<Comment> findByPostId(Long postId);

  @Query("SELECT c FROM Comment c ORDER BY COALESCE(c.updatedAt, c.createdAt) DESC")
  List<Comment> findByUserId(Long userId);
}
