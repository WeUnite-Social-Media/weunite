import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/app_notification.dart';
import '../../domain/entities/notification_filter.dart';
import '../../domain/repositories/notification_repository.dart';

part 'notifications_state.dart';

/// Notification list + unread badge, shared by the bell (`AppShell`'s
/// `AppBar`) and the `/notifications` screen — one cubit, one source of
/// truth for the counter, following the same pattern as `ChatCubit`'s
/// `totalUnreadCount`.
///
/// Filtering, searching, and grouping by period all happen client-side over
/// the one unpaginated list the API returns, mirroring `apps/web`.
class NotificationsCubit extends Cubit<NotificationsState> {
  NotificationsCubit(this._repository) : super(const NotificationsState());

  final NotificationRepository _repository;
  StreamSubscription<AppNotification>? _realtimeSubscription;

  Future<void> load() async {
    final hadNotifications = state.notifications.isNotEmpty;
    emit(
      state.copyWith(
        isLoading: !hadNotifications,
        loadErrorMessage: () => null,
        actionErrorMessage: () => null,
      ),
    );
    try {
      late List<AppNotification> notifications;
      late int unreadCount;
      await Future.wait([
        _repository.getNotifications().then((value) => notifications = value),
        _repository.getUnreadCount().then((value) => unreadCount = value),
      ]);
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          notifications: notifications,
          unreadCount: unreadCount,
        ),
      );
      _ensureRealtimeSubscription();
    } on AppException catch (error) {
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          loadErrorMessage: hadNotifications ? null : () => error.message,
          actionErrorMessage: hadNotifications ? () => error.message : null,
        ),
      );
    }
  }

  void _ensureRealtimeSubscription() {
    _realtimeSubscription ??=
        _repository.watchNewNotifications().listen(_onNotificationReceived);
  }

  void _onNotificationReceived(AppNotification notification) {
    if (state.notifications.any((item) => item.id == notification.id)) {
      return;
    }
    emit(
      state.copyWith(
        notifications: [notification, ...state.notifications],
        unreadCount:
            notification.isRead ? state.unreadCount : state.unreadCount + 1,
      ),
    );
  }

  /// Marks one notification as read: optimistic, reverted on failure.
  Future<void> markAsRead(int notificationId) async {
    final target = state.notifications
        .where((notification) => notification.id == notificationId)
        .firstOrNull;
    if (target == null || target.isRead) {
      return;
    }
    final previousNotifications = state.notifications;
    final previousUnreadCount = state.unreadCount;

    emit(
      state.copyWith(
        notifications: _replace(
          previousNotifications,
          notificationId,
          (notification) => notification.copyWith(isRead: true),
        ),
        unreadCount: _decrement(previousUnreadCount),
        actionErrorMessage: () => null,
      ),
    );
    try {
      await _repository.markAsRead(notificationId);
    } on AppException catch (error) {
      emit(
        state.copyWith(
          notifications: previousNotifications,
          unreadCount: previousUnreadCount,
          actionErrorMessage: () => error.message,
        ),
      );
    }
  }

  /// Marks every notification as read: optimistic, reverted on failure.
  Future<void> markAllAsRead() async {
    if (!state.hasUnread) {
      return;
    }
    final previousNotifications = state.notifications;
    final previousUnreadCount = state.unreadCount;

    emit(
      state.copyWith(
        notifications: [
          for (final notification in previousNotifications)
            notification.copyWith(isRead: true),
        ],
        unreadCount: 0,
        actionErrorMessage: () => null,
      ),
    );
    try {
      await _repository.markAllAsRead();
    } on AppException catch (error) {
      emit(
        state.copyWith(
          notifications: previousNotifications,
          unreadCount: previousUnreadCount,
          actionErrorMessage: () => error.message,
        ),
      );
    }
  }

  /// Removes a notification: optimistic, reverted on failure.
  Future<void> delete(int notificationId) async {
    final previousNotifications = state.notifications;
    final target = previousNotifications
        .where((notification) => notification.id == notificationId)
        .firstOrNull;
    if (target == null) {
      return;
    }
    final previousUnreadCount = state.unreadCount;

    emit(
      state.copyWith(
        notifications: [
          for (final notification in previousNotifications)
            if (notification.id != notificationId) notification,
        ],
        unreadCount: target.isRead
            ? previousUnreadCount
            : _decrement(previousUnreadCount),
        actionErrorMessage: () => null,
      ),
    );
    try {
      await _repository.delete(notificationId);
    } on AppException catch (error) {
      emit(
        state.copyWith(
          notifications: previousNotifications,
          unreadCount: previousUnreadCount,
          actionErrorMessage: () => error.message,
        ),
      );
    }
  }

  void filterChanged(NotificationFilter filter) {
    emit(state.copyWith(filter: filter));
  }

  void queryChanged(String query) {
    emit(state.copyWith(query: query));
  }

  void clearFilters() {
    emit(state.copyWith(filter: NotificationFilter.all, query: ''));
  }

  List<AppNotification> _replace(
    List<AppNotification> notifications,
    int notificationId,
    AppNotification Function(AppNotification notification) update,
  ) {
    return [
      for (final notification in notifications)
        if (notification.id == notificationId)
          update(notification)
        else
          notification,
    ];
  }

  int _decrement(int unreadCount) => unreadCount > 0 ? unreadCount - 1 : 0;

  void dismissActionError() {
    if (state.actionErrorMessage == null) {
      return;
    }
    emit(state.copyWith(actionErrorMessage: () => null));
  }

  @override
  Future<void> close() async {
    await _realtimeSubscription?.cancel();
    return super.close();
  }
}
