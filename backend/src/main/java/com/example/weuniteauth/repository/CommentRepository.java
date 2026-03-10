package com.example.weuniteauth.repository;

import com.example.weuniteauth.domain.post.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostId(Long postId);

    @Query("SELECT c FROM Comment c ORDER BY COALESCE(c.updatedAt, c.createdAt) DESC")
    List<Comment> findByUserId(Long userId);

}




