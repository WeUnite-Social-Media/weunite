package com.weunite.api.notifications.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.notifications.dto.NotificationDTO;
import com.weunite.api.notifications.dto.UnreadNotificationCountDTO;
import com.weunite.api.notifications.service.NotificationService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

  @Mock private NotificationService notificationService;
  @Mock private AuthenticatedUserService authenticatedUserService;

  @InjectMocks private NotificationController notificationController;

  @Test
  @DisplayName("Should list notifications only for the authenticated recipient")
  void getUserNotificationsUsesAuthenticatedRecipient() {
    Jwt jwt = mock(Jwt.class);
    List<NotificationDTO> expected = List.of();

    when(authenticatedUserService.requireMatchingUserId(jwt, 11L)).thenReturn(11L);
    when(notificationService.getUserNotifications(11L)).thenReturn(expected);

    ResponseEntity<List<NotificationDTO>> result =
        notificationController.getUserNotifications(jwt, 11L);

    assertEquals(expected, result.getBody());
    verify(notificationService).getUserNotifications(11L);
  }

  @Test
  @DisplayName("Should count unread notifications only for the authenticated recipient")
  void getUnreadCountUsesAuthenticatedRecipient() {
    Jwt jwt = mock(Jwt.class);
    UnreadNotificationCountDTO expected = new UnreadNotificationCountDTO(3L);

    when(authenticatedUserService.requireMatchingUserId(jwt, 11L)).thenReturn(11L);
    when(notificationService.getUnreadCount(11L)).thenReturn(expected);

    ResponseEntity<UnreadNotificationCountDTO> result =
        notificationController.getUnreadCount(jwt, 11L);

    assertEquals(expected, result.getBody());
    verify(notificationService).getUnreadCount(11L);
  }

  @Test
  @DisplayName("Should scope notification item writes to the authenticated recipient")
  void itemWritesUseAuthenticatedRecipient() {
    Jwt jwt = mock(Jwt.class);
    when(authenticatedUserService.requireUserId(jwt)).thenReturn(11L);

    notificationController.markAsRead(jwt, 44L);
    notificationController.deleteNotification(jwt, 45L);

    verify(notificationService).markAsRead(11L, 44L);
    verify(notificationService).deleteNotification(11L, 45L);
  }

  @Test
  @DisplayName("Should mark all notifications only for the authenticated recipient")
  void markAllAsReadUsesAuthenticatedRecipient() {
    Jwt jwt = mock(Jwt.class);
    when(authenticatedUserService.requireMatchingUserId(jwt, 11L)).thenReturn(11L);

    notificationController.markAllAsRead(jwt, 11L);

    verify(notificationService).markAllAsRead(11L);
  }
}
