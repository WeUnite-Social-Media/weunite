package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.notifications.domain.NotificationType;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.posts.domain.Comment;
import com.weunite.api.posts.domain.Like;
import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.dto.LikeDTO;
import com.weunite.api.posts.mapper.LikeMapper;
import com.weunite.api.posts.repository.CommentRepository;
import com.weunite.api.posts.repository.LikeRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.posts.service.LikeService;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class LikeServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private PostRepository postRepository;
  @Mock private CommentRepository commentRepository;
  @Mock private LikeRepository likeRepository;
  @Mock private LikeMapper likeMapper;
  @Mock private NotificationService notificationService;

  @InjectMocks private LikeService likeService;

  @Test
  @DisplayName("Should create post like and notify the post owner")
  void toggleLikeCreateSuccess() {
    Long userId = 1L;
    Long postId = 10L;

    User user = new User();
    user.setId(userId);

    User postOwner = new User();
    postOwner.setId(2L);

    Post post = new Post();
    post.setId(postId);
    post.setUser(postOwner);

    ResponseDTO<LikeDTO> expectedResponse =
        new ResponseDTO<>("Curtida criada com sucesso!", new LikeDTO("1", null, null));

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(postRepository.findByIdAndDeletedFalse(postId)).thenReturn(Optional.of(post));
    when(likeRepository.findByUserAndPost(user, post)).thenReturn(Optional.empty());
    when(likeMapper.toResponseDTO(eq("Curtida criada com sucesso!"), any(Like.class)))
        .thenReturn(expectedResponse);

    ResponseDTO<LikeDTO> result = likeService.toggleLike(userId, postId);

    assertNotNull(result);
    assertEquals(expectedResponse, result);
    verify(likeRepository).save(any(Like.class));
    verify(notificationService)
        .createNotification(postOwner.getId(), NotificationType.POST_LIKE, userId, postId, null);
  }

  @Test
  @DisplayName("Should create comment like and notify the comment owner")
  void toggleLikeCommentCreateSuccess() {
    Long userId = 1L;
    Long commentId = 20L;

    User user = new User();
    user.setId(userId);

    User commentOwner = new User();
    commentOwner.setId(3L);

    Comment comment = new Comment();
    comment.setId(commentId);
    comment.setUser(commentOwner);

    ResponseDTO<LikeDTO> expectedResponse =
        new ResponseDTO<>("Curtida criada com sucesso!", new LikeDTO("1", null, null));

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));
    when(likeRepository.findByUserAndComment(user, comment)).thenReturn(Optional.empty());
    when(likeMapper.toResponseDTO(eq("Curtida criada com sucesso!"), any(Like.class)))
        .thenReturn(expectedResponse);

    ResponseDTO<LikeDTO> result = likeService.toggleLikeComment(userId, commentId);

    assertNotNull(result);
    assertEquals(expectedResponse, result);
    verify(likeRepository).save(any(Like.class));
    verify(notificationService)
        .createNotification(
            commentOwner.getId(), NotificationType.COMMENT_LIKE, userId, commentId, null);
  }

  @Test
  @DisplayName("Should remove existing like without creating a notification")
  void toggleLikeRemoveSuccess() {
    Long userId = 1L;
    Long postId = 10L;

    User user = new User();
    user.setId(userId);

    Post post = new Post();
    post.setId(postId);
    post.setUser(user);

    Like existingLike = new Like(post, user);
    existingLike.setId(99L);

    ResponseDTO<LikeDTO> expectedResponse =
        new ResponseDTO<>("Curtida deletada com sucesso!", new LikeDTO("99", null, null));

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(postRepository.findByIdAndDeletedFalse(postId)).thenReturn(Optional.of(post));
    when(likeRepository.findByUserAndPost(user, post)).thenReturn(Optional.of(existingLike));
    when(likeMapper.toResponseDTO(eq("Curtida deletada com sucesso!"), eq(existingLike)))
        .thenReturn(expectedResponse);

    ResponseDTO<LikeDTO> result = likeService.toggleLike(userId, postId);

    assertEquals(expectedResponse, result);
    verify(likeRepository).delete(existingLike);
    verifyNoInteractions(notificationService);
  }
}
