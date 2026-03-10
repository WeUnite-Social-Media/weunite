package com.example.weuniteauth.repository;

import com.example.weuniteauth.domain.post.Comment;
import com.example.weuniteauth.domain.post.Like;
import com.example.weuniteauth.domain.post.Post;
import com.example.weuniteauth.domain.users.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;

public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByUserAndPost(User user, Post post);

    Optional<Like> findByUserAndComment(User user, Comment comment);

    Set<Like> findByUser(User user);

    Page<Like> findByUser(User user, Pageable pageable);

    Set<Like> findByComment(Comment comment);

}
