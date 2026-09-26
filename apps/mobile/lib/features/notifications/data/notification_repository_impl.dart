import 'dart:convert';

import '../../../core/realtime/realtime_client.dart';
import '../../../core/session/current_user_provider.dart';
import '../domain/entities/app_notification.dart';
import '../domain/repositories/notification_repository.dart';
import 'notification_models.dart';
import 'notification_remote_data_source.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  NotificationRepositoryImpl({
    required NotificationRemoteDataSource remoteDataSource,
    required RealtimeClient realtimeClient,
    required CurrentUserProvider currentUserProvider,
  })  : _remoteDataSource = remoteDataSource,
        _realtimeClient = realtimeClient,
        _currentUserProvider = currentUserProvider;

  final NotificationRemoteDataSource _remoteDataSource;
  final RealtimeClient _realtimeClient;
  final CurrentUserProvider _currentUserProvider;

  @override
  Future<List<AppNotification>> getNotifications() async {
    final userId = _currentUserProvider.requireUserId();
    final dtos = await _remoteDataSource.getNotifications(userId);
    return dtos.map((dto) => dto.toEntity()).toList();
  }

  @override
  Future<int> getUnreadCount() {
    final userId = _currentUserProvider.requireUserId();
    return _remoteDataSource.getUnreadCount(userId);
  }

  @override
  Future<void> markAsRead(int notificationId) {
    return _remoteDataSource.markAsRead(notificationId);
  }

  @override
  Future<void> markAllAsRead() {
    final userId = _currentUserProvider.requireUserId();
    return _remoteDataSource.markAllAsRead(userId);
  }

  @override
  Future<void> delete(int notificationId) {
    return _remoteDataSource.delete(notificationId);
  }

  @override
  Stream<AppNotification> watchNewNotifications() {
    final userId = _currentUserProvider.requireUserId();
    return _realtimeClient.subscribe<AppNotification>(
      '/topic/user/$userId/notifications',
      (body) {
        try {
          final decoded = jsonDecode(body);
          if (decoded is! Map<String, dynamic>) {
            return null;
          }
          return NotificationDto.fromJson(decoded).toEntity();
        } on FormatException {
          return null;
        } on TypeError {
          return null;
        } on ArgumentError {
          return null;
        }
      },
    );
  }
}
