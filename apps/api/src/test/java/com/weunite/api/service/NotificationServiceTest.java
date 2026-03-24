package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.weunite.api.notifications.domain.Notification;
import com.weunite.api.notifications.domain.NotificationType;
import com.weunite.api.notifications.dto.NotificationDTO;
import com.weunite.api.notifications.mapper.NotificationMapper;
import com.weunite.api.notifications.repository.NotificationRepository;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

  @Mock private NotificationRepository notificationRepository;
  @Mock private UserRepository userRepository;
  @Mock private NotificationMapper notificationMapper;
  @Mock private SimpMessagingTemplate messagingTemplate;

  @InjectMocks private NotificationService notificationService;

  @Test
  @DisplayName("Should create notification and publish it over websocket")
  void createNotificationSuccess() {
    Long userId = 2L;
    Long actorId = 1L;
    Long relatedEntityId = 10L;

    User actor = new User();
    actor.setId(actorId);
    actor.setName("Actor Name");
    actor.setUsername("actor");
    actor.setProfileImg("profile.png");

    Notification savedNotification = new Notification();
    savedNotification.setId(100L);
    savedNotification.setUserId(userId);
    savedNotification.setType(NotificationType.POST_LIKE);
    savedNotification.setActorId(actorId);
    savedNotification.setActorName(actor.getName());
    savedNotification.setActorUsername(actor.getUsername());
    savedNotification.setActorProfileImg(actor.getProfileImg());
    savedNotification.setRelatedEntityId(relatedEntityId);
    savedNotification.setMessage("curtiu sua publicação");
    savedNotification.setRead(false);
    savedNotification.setCreatedAt(Instant.now());

    NotificationDTO expectedNotification =
        new NotificationDTO(
            100L,
            userId,
            NotificationType.POST_LIKE,
            actorId,
            actor.getName(),
            actor.getUsername(),
            actor.getProfileImg(),
            relatedEntityId,
            "curtiu sua publicação",
            false,
            savedNotification.getCreatedAt());

    when(userRepository.findById(actorId)).thenReturn(Optional.of(actor));
    when(notificationRepository.save(any(Notification.class))).thenReturn(savedNotification);
    when(notificationMapper.toDTO(savedNotification)).thenReturn(expectedNotification);

    NotificationDTO result =
        notificationService.createNotification(
            userId, NotificationType.POST_LIKE, actorId, relatedEntityId, null);

    assertEquals(expectedNotification, result);
    verify(messagingTemplate)
        .convertAndSend("/topic/user/" + userId + "/notifications", expectedNotification);
  }

  @Test
  @DisplayName("Should skip notification when actor and recipient are the same user")
  void createNotificationSkipsSelfInteraction() {
    NotificationDTO result =
        notificationService.createNotification(
            1L, NotificationType.POST_LIKE, 1L, 10L, "custom message");

    assertNull(result);
    verifyNoInteractions(
        userRepository, notificationRepository, notificationMapper, messagingTemplate);
  }
}
