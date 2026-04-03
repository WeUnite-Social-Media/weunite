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
import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.domain.Repost;
import com.weunite.api.posts.dto.RepostDTO;
import com.weunite.api.posts.mapper.RepostMapper;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.posts.repository.RepostRepository;
import com.weunite.api.posts.service.RepostService;
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
public class RepostServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private PostRepository postRepository;
  @Mock private RepostRepository repostRepository;
  @Mock private RepostMapper repostMapper;
  @Mock private NotificationService notificationService;

  @InjectMocks private RepostService repostService;

  @Test
  @DisplayName("Should create repost and notify the original post owner")
  void toggleRepostCreateSuccess() {
    Long userId = 1L;
    Long postId = 10L;

    User user = new User();
    user.setId(userId);

    User postOwner = new User();
    postOwner.setId(2L);

    Post post = new Post();
    post.setId(postId);
    post.setUser(postOwner);

    ResponseDTO<RepostDTO> expectedResponse =
        new ResponseDTO<>("Post republicado com sucesso!", new RepostDTO("1", null, null));

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(postRepository.findById(postId)).thenReturn(Optional.of(post));
    when(repostRepository.findByUserAndPost(user, post)).thenReturn(Optional.empty());
    when(repostMapper.toResponseDTO(eq("Post republicado com sucesso!"), any(Repost.class)))
        .thenReturn(expectedResponse);

    ResponseDTO<RepostDTO> result = repostService.toggleRepost(userId, postId);

    assertNotNull(result);
    assertEquals(expectedResponse, result);
    verify(repostRepository).save(any(Repost.class));
    verify(notificationService)
        .createNotification(postOwner.getId(), NotificationType.POST_REPOST, userId, postId, null);
  }

  @Test
  @DisplayName("Should remove repost without creating a notification")
  void toggleRepostRemoveSuccess() {
    Long userId = 1L;
    Long postId = 10L;

    User user = new User();
    user.setId(userId);

    Post post = new Post();
    post.setId(postId);
    post.setUser(user);

    Repost existingRepost = new Repost(post, user);
    existingRepost.setId(5L);

    ResponseDTO<RepostDTO> expectedResponse =
        new ResponseDTO<>("Repost removido com sucesso!", new RepostDTO("5", null, null));

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(postRepository.findById(postId)).thenReturn(Optional.of(post));
    when(repostRepository.findByUserAndPost(user, post)).thenReturn(Optional.of(existingRepost));
    when(repostMapper.toResponseDTO(eq("Repost removido com sucesso!"), eq(existingRepost)))
        .thenReturn(expectedResponse);

    ResponseDTO<RepostDTO> result = repostService.toggleRepost(userId, postId);

    assertEquals(expectedResponse, result);
    verify(repostRepository).delete(existingRepost);
    verifyNoInteractions(notificationService);
  }
}
