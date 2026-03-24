package com.weunite.api.notifications.controller;

import com.weunite.api.notifications.dto.NotificationDTO;
import com.weunite.api.notifications.dto.UnreadNotificationCountDTO;
import com.weunite.api.notifications.service.NotificationService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

  private final NotificationService notificationService;

  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  @GetMapping("/user/{userId}")
  public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable Long userId) {
    List<NotificationDTO> notifications = notificationService.getUserNotifications(userId);
    return ResponseEntity.ok(notifications);
  }

  @GetMapping("/user/{userId}/unread-count")
  public ResponseEntity<UnreadNotificationCountDTO> getUnreadCount(@PathVariable Long userId) {
    UnreadNotificationCountDTO unreadCount = notificationService.getUnreadCount(userId);
    return ResponseEntity.ok(unreadCount);
  }

  @PutMapping("/{notificationId}/read")
  public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
    notificationService.markAsRead(notificationId);
    return ResponseEntity.ok().build();
  }

  @PutMapping("/user/{userId}/read-all")
  public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
    notificationService.markAllAsRead(userId);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/{notificationId}")
  public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
    notificationService.deleteNotification(notificationId);
    return ResponseEntity.ok().build();
  }
}
