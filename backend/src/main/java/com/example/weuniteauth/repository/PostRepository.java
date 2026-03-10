package com.example.weuniteauth.repository;

import com.example.weuniteauth.domain.post.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p ORDER BY COALESCE(p.updatedAt, p.createdAt) DESC")
    List<Post> findAllOrderedByCreationDate();

}
