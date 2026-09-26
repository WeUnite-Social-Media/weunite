import '../entities/app_notification.dart';

abstract class NotificationRepository {
  /// `GET /notifications/user/{userId}` — a raw array, no envelope, already
  /// ordered by `createdAt` desc, no pagination.
  Future<List<AppNotification>> getNotifications();

  /// `GET /notifications/user/{userId}/unread-count`.
  Future<int> getUnreadCount();

  /// `PUT /notifications/{notificationId}/read`.
  Future<void> markAsRead(int notificationId);

  /// `PUT /notifications/user/{userId}/read-all`.
  Future<void> markAllAsRead();

  /// `DELETE /notifications/{notificationId}`.
  Future<void> delete(int notificationId);

  /// New notifications pushed to `/topic/user/{userId}/notifications`.
  Stream<AppNotification> watchNewNotifications();
}
