import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/json_body.dart';
import 'notification_models.dart';

class NotificationRemoteDataSource {
  const NotificationRemoteDataSource(this._dio);

  final Dio _dio;

  /// `GET /notifications/user/{userId}` — a raw array, no envelope, already
  /// ordered by `createdAt` desc.
  Future<List<NotificationDto>> getNotifications(int userId) async {
    try {
      final response = await _dio.get<Object?>('/notifications/user/$userId');
      return decodeJsonList(response.data, NotificationDto.fromJson);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `GET /notifications/user/{userId}/unread-count` — a raw
  /// `{"unreadCount": <number>}` object, no envelope.
  Future<int> getUnreadCount(int userId) async {
    try {
      final response =
          await _dio.get<Object?>('/notifications/user/$userId/unread-count');
      return UnreadCountDto.fromJson(asJsonObject(response.data)).unreadCount;
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `PUT /notifications/{notificationId}/read` — 200, no body.
  Future<void> markAsRead(int notificationId) async {
    try {
      await _dio.put<void>('/notifications/$notificationId/read');
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `PUT /notifications/user/{userId}/read-all` — 200, no body.
  Future<void> markAllAsRead(int userId) async {
    try {
      await _dio.put<void>('/notifications/user/$userId/read-all');
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `DELETE /notifications/{notificationId}` — 200, no body.
  Future<void> delete(int notificationId) async {
    try {
      await _dio.delete<void>('/notifications/$notificationId');
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }
}
