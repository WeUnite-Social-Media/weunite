package com.weunite.api.posts.domain;

import static org.junit.jupiter.api.Assertions.assertThrows;

import com.weunite.api.posts.repository.CommentRepository;
import com.weunite.api.posts.repository.LikeRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.posts.repository.RepostRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

@DataJpaTest
class PostInteractionPersistenceTest {

  @Autowired private UserRepository userRepository;

  @Autowired private PostRepository postRepository;

  @Autowired private CommentRepository commentRepository;

  @Autowired private LikeRepository likeRepository;

  @Autowired private RepostRepository repostRepository;

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
}
