package com.weunite.api.notifications.controller;

import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.notifications.dto.NotificationDTO;
import com.weunite.api.notifications.dto.UnreadNotificationCountDTO;
import com.weunite.api.notifications.service.NotificationService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

  private final NotificationService notificationService;
  private final AuthenticatedUserService authenticatedUserService;

  public NotificationController(
      NotificationService notificationService, AuthenticatedUserService authenticatedUserService) {
    this.notificationService = notificationService;
    this.authenticatedUserService = authenticatedUserService;
  }

  @GetMapping("/user/{userId}")
  public ResponseEntity<List<NotificationDTO>> getUserNotifications(
      @AuthenticationPrincipal Jwt jwt, @PathVariable Long userId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    List<NotificationDTO> notifications =
        notificationService.getUserNotifications(authenticatedUserId);
    return ResponseEntity.ok(notifications);
  }

  @GetMapping("/user/{userId}/unread-count")
  public ResponseEntity<UnreadNotificationCountDTO> getUnreadCount(
      @AuthenticationPrincipal Jwt jwt, @PathVariable Long userId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    UnreadNotificationCountDTO unreadCount =
        notificationService.getUnreadCount(authenticatedUserId);
    return ResponseEntity.ok(unreadCount);
  }

  @PutMapping("/{notificationId}/read")
  public ResponseEntity<Void> markAsRead(
      @AuthenticationPrincipal Jwt jwt, @PathVariable Long notificationId) {
    Long authenticatedUserId = authenticatedUserService.requireUserId(jwt);
    notificationService.markAsRead(authenticatedUserId, notificationId);
    return ResponseEntity.ok().build();
  }

  @PutMapping("/user/{userId}/read-all")
  public ResponseEntity<Void> markAllAsRead(
      @AuthenticationPrincipal Jwt jwt, @PathVariable Long userId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    notificationService.markAllAsRead(authenticatedUserId);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/{notificationId}")
  public ResponseEntity<Void> deleteNotification(
      @AuthenticationPrincipal Jwt jwt, @PathVariable Long notificationId) {
    Long authenticatedUserId = authenticatedUserService.requireUserId(jwt);
    notificationService.deleteNotification(authenticatedUserId, notificationId);
    return ResponseEntity.ok().build();
  }
}
