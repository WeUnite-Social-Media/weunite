package com.weunite.api.posts.repository;

import com.weunite.api.posts.domain.Comment;
import com.weunite.api.posts.domain.Like;
import com.weunite.api.posts.domain.Post;
import com.weunite.api.users.domain.User;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {

  @EntityGraph(attributePaths = {"user", "post", "post.user"})
  Optional<Like> findByUserAndPost(User user, Post post);

  @EntityGraph(attributePaths = {"user", "comment", "comment.user"})
  Optional<Like> findByUserAndComment(User user, Comment comment);

  @EntityGraph(attributePaths = {"user", "post", "post.user", "comment", "comment.user"})
  Set<Like> findByUser(User user);

  @EntityGraph(attributePaths = {"user", "post", "post.user", "comment", "comment.user"})
  Page<Like> findByUser(User user, Pageable pageable);

  @EntityGraph(attributePaths = {"user", "comment", "comment.user"})
  Set<Like> findByComment(Comment comment);

  void deleteByPostId(Long postId);
}
