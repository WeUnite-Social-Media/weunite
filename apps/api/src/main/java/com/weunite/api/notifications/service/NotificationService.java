package com.weunite.api.notifications.service;

import com.weunite.api.common.exception.NotFoundResourceException;
import com.weunite.api.notifications.domain.Notification;
import com.weunite.api.notifications.domain.NotificationType;
import com.weunite.api.notifications.dto.NotificationDTO;
import com.weunite.api.notifications.dto.UnreadNotificationCountDTO;
import com.weunite.api.notifications.mapper.NotificationMapper;
import com.weunite.api.notifications.repository.NotificationRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.UserRepository;
import java.util.List;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final UserRepository userRepository;
  private final NotificationMapper notificationMapper;
  private final SimpMessagingTemplate messagingTemplate;

  public NotificationService(
      NotificationRepository notificationRepository,
      UserRepository userRepository,
      NotificationMapper notificationMapper,
      SimpMessagingTemplate messagingTemplate) {
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
    this.notificationMapper = notificationMapper;
    this.messagingTemplate = messagingTemplate;
  }

  @Transactional
  public NotificationDTO createNotification(
      Long userId,
      NotificationType type,
      Long actorId,
      Long relatedEntityId,
      String customMessage) {
    if (userId.equals(actorId)) {
      return null;
    }

    User actor = userRepository.findById(actorId).orElseThrow(UserNotFoundException::new);

    Notification notification = new Notification();
    notification.setUserId(userId);
    notification.setType(type);
    notification.setActorId(actorId);
    notification.setActorName(actor.getName());
    notification.setActorUsername(actor.getUsername());
    notification.setActorProfileImg(actor.getProfileImg());
    notification.setRelatedEntityId(relatedEntityId);
    notification.setMessage(customMessage != null ? customMessage : generateMessage(type));
    notification.setRead(false);

    Notification savedNotification = notificationRepository.save(notification);
    NotificationDTO notificationDTO = notificationMapper.toDTO(savedNotification);

    messagingTemplate.convertAndSend("/topic/user/" + userId + "/notifications", notificationDTO);

    return notificationDTO;
  }

  @Transactional(readOnly = true)
  public List<NotificationDTO> getUserNotifications(Long userId) {
    ensureUserExists(userId);
    return notificationMapper.toDTOList(
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId));
  }

  @Transactional(readOnly = true)
  public UnreadNotificationCountDTO getUnreadCount(Long userId) {
    ensureUserExists(userId);
    return new UnreadNotificationCountDTO(
        notificationRepository.countByUserIdAndIsReadFalse(userId));
  }

  @Transactional
  public void markAsRead(Long userId, Long notificationId) {
    Notification notification = requireOwnedNotification(userId, notificationId);
    notification.setRead(true);
  }

  @Transactional
  public void markAllAsRead(Long userId) {
    ensureUserExists(userId);
    notificationRepository.markAllAsReadByUserId(userId);
  }

  @Transactional
  public void deleteNotification(Long userId, Long notificationId) {
    Notification notification = requireOwnedNotification(userId, notificationId);
    notificationRepository.delete(notification);
  }

  private void ensureUserExists(Long userId) {
    if (!userRepository.existsById(userId)) {
      throw new UserNotFoundException();
    }
  }

  private Notification requireOwnedNotification(Long userId, Long notificationId) {
    return notificationRepository
        .findByIdAndUserId(notificationId, userId)
        .orElseThrow(
            () ->
                new NotFoundResourceException("Notification not found with id: " + notificationId));
  }

  private String generateMessage(NotificationType type) {
    return switch (type) {
      case POST_LIKE -> "curtiu sua publicação";
      case POST_COMMENT -> "comentou na sua publicação";
      case COMMENT_LIKE -> "curtiu seu comentário";
      case COMMENT_REPLY -> "respondeu seu comentário";
      case NEW_FOLLOWER -> "começou a seguir você";
      case NEW_MESSAGE -> "enviou uma mensagem";
      case POST_REPOST -> "republicou seu post";
      case OPPORTUNITY_SUBSCRIPTION -> "se inscreveu na sua oportunidade";
    };
  }
}
