package com.weunite.api.posts.repository;

import com.weunite.api.posts.domain.Comment;
import com.weunite.api.posts.domain.Like;
import com.weunite.api.posts.domain.Post;
import com.weunite.api.users.domain.User;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {

  Optional<Like> findByUserAndPost(User user, Post post);

  Optional<Like> findByUserAndComment(User user, Comment comment);

  Set<Like> findByUser(User user);

  Page<Like> findByUser(User user, Pageable pageable);

  Set<Like> findByComment(Comment comment);
}
