package com.weunite.api.posts.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.weunite.api.posts.repository.CommentRepository;
import com.weunite.api.posts.repository.LikeRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.posts.repository.RepostRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import jakarta.persistence.EntityManager;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;

@DataJpaTest
class PostInteractionPersistenceTest {

  @Autowired private UserRepository userRepository;

  @Autowired private PostRepository postRepository;

  @Autowired private CommentRepository commentRepository;

  @Autowired private LikeRepository likeRepository;

  @Autowired private RepostRepository repostRepository;

  @Autowired private EntityManager entityManager;

  @Test
  @DisplayName("Should enforce one like per user and post")
  void enforceUniquePostLike() {
    User author = userRepository.save(new User("Author", "author", "author@example.com", "p"));
    User user = userRepository.save(new User("Liker", "liker", "liker@example.com", "p"));
    Post post = postRepository.save(new Post(author, "Post"));

    likeRepository.saveAndFlush(new Like(post, user));

    assertThrows(
        DataIntegrityViolationException.class,
        () -> likeRepository.saveAndFlush(new Like(post, user)));
  }

  @Test
  @DisplayName("Should enforce one like per user and comment")
  void enforceUniqueCommentLike() {
    User author = userRepository.save(new User("Author", "author2", "author2@example.com", "p"));
    User user = userRepository.save(new User("Liker", "liker2", "liker2@example.com", "p"));
    Post post = postRepository.save(new Post(author, "Post"));
    Comment comment = commentRepository.save(new Comment(author, post, "Comment", null));

    likeRepository.saveAndFlush(new Like(comment, user));

    assertThrows(
        DataIntegrityViolationException.class,
        () -> likeRepository.saveAndFlush(new Like(comment, user)));
  }

  @Test
  @DisplayName("Should enforce one repost per user and post")
  void enforceUniqueRepost() {
    User author = userRepository.save(new User("Author", "author3", "author3@example.com", "p"));
    User user = userRepository.save(new User("Reposter", "reposter", "reposter@example.com", "p"));
    Post post = postRepository.save(new Post(author, "Post"));

    repostRepository.saveAndFlush(new Repost(post, user));

    assertThrows(
        DataIntegrityViolationException.class,
        () -> repostRepository.saveAndFlush(new Repost(post, user)));
  }

  @Test
  @DisplayName("Should keep like lifecycle repository-owned when post collections change")
  void keepLikeLifecycleRepositoryOwned() {
    User author = userRepository.save(new User("Author", "author4", "author4@example.com", "p"));
    User user = userRepository.save(new User("Liker", "liker4", "liker4@example.com", "p"));
    Post post = postRepository.save(new Post(author, "Post"));
    likeRepository.saveAndFlush(new Like(post, user));

    entityManager.clear();

    Post reloadedPost = postRepository.findById(post.getId()).orElseThrow();
    reloadedPost.getLikes().clear();
    postRepository.saveAndFlush(reloadedPost);

    entityManager.clear();

    assertEquals(1, likeRepository.count());
  }

  @Test
  @DisplayName("Should keep repost lifecycle repository-owned when post collections change")
  void keepRepostLifecycleRepositoryOwned() {
    User author = userRepository.save(new User("Author", "author5", "author5@example.com", "p"));
    User user =
        userRepository.save(new User("Reposter", "reposter5", "reposter5@example.com", "p"));
    Post post = postRepository.save(new Post(author, "Post"));
    repostRepository.saveAndFlush(new Repost(post, user));

    entityManager.clear();

    Post reloadedPost = postRepository.findById(post.getId()).orElseThrow();
    reloadedPost.getReposts().clear();
    postRepository.saveAndFlush(reloadedPost);

    entityManager.clear();

    assertEquals(1, repostRepository.count());
  }

  @Test
  @DisplayName("Should retain soft deleted posts while removing them from active feed lookups")
  void hideSoftDeletedPostsFromActiveReads() {
    User author = userRepository.save(new User("Author", "author6", "author6@example.com", "p"));
    Post post = postRepository.save(new Post(author, "Post"));

    post.setDeleted(true);
    postRepository.saveAndFlush(post);

    entityManager.clear();

    assertTrue(postRepository.findById(post.getId()).isPresent());
    assertFalse(postRepository.findByIdAndDeletedFalse(post.getId()).isPresent());
    assertTrue(postRepository.findFeedEntries(PageRequest.of(0, 10)).isEmpty());
  }

  @Test
  @DisplayName("Should retain deleted comments while keeping non-deleted replies publicly readable")
  void hideSoftDeletedCommentWithoutRemovingReply() {
    User author = userRepository.save(new User("Author", "author7", "author7@example.com", "p"));
    Post post = postRepository.save(new Post(author, "Post"));
    Comment parent = commentRepository.save(new Comment(author, post, "Parent", null));
    Comment reply = new Comment(author, post, "Reply", null);
    reply.setParentComment(parent);
    commentRepository.save(reply);

    parent.setDeleted(true);
    commentRepository.saveAndFlush(parent);

    entityManager.clear();

    assertTrue(commentRepository.findById(parent.getId()).isPresent());
    assertFalse(commentRepository.findByIdAndDeletedFalse(parent.getId()).isPresent());
    assertEquals(
        List.of(reply.getId()),
        commentRepository.findByPostIdAndDeletedFalse(post.getId()).stream()
            .map(Comment::getId)
            .toList());
  }
}
