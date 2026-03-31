package com.weunite.api.posts.repository;

import com.weunite.api.posts.domain.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentRepository extends JpaRepository<Comment, Long> {

  List<Comment> findByPostId(Long postId);

  Long countByUserIdAndDeletedFalse(Long userId);

  @Query(
      "SELECT c FROM Comment c WHERE c.user.id = :userId "
          + "ORDER BY COALESCE(c.updatedAt, c.createdAt) DESC")
  List<Comment> findByUserId(@Param("userId") Long userId);
}
