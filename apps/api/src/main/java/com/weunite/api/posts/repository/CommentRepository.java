package com.weunite.api.posts.repository;

import com.weunite.api.posts.domain.Comment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentRepository extends JpaRepository<Comment, Long> {

  List<Comment> findByPostIdAndDeletedFalse(Long postId);

  Optional<Comment> findByIdAndDeletedFalse(Long commentId);

  boolean existsByIdAndUserId(Long commentId, Long userId);

  Long countByUserIdAndDeletedFalse(Long userId);

  @Query(
      "SELECT c.user.id, COUNT(c) FROM Comment c "
          + "WHERE c.deleted = false AND c.user.id IN :userIds "
          + "GROUP BY c.user.id")
  List<Object[]> countActiveCommentsByUserIds(@Param("userIds") List<Long> userIds);

  @Query(
      "SELECT c FROM Comment c WHERE c.user.id = :userId AND c.deleted = false "
          + "ORDER BY COALESCE(c.updatedAt, c.createdAt) DESC")
  List<Comment> findByUserIdAndDeletedFalse(@Param("userId") Long userId);
}
