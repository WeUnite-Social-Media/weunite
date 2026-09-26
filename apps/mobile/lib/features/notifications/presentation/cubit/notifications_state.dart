part of 'notifications_cubit.dart';

class NotificationsState extends Equatable {
  const NotificationsState({
    this.notifications = const [],
    this.unreadCount = 0,
    this.filter = NotificationFilter.all,
    this.query = '',
    this.isLoading = false,
    this.hasLoaded = false,
    this.loadErrorMessage,
    this.actionErrorMessage,
  });

  final List<AppNotification> notifications;
  final int unreadCount;
  final NotificationFilter filter;
  final String query;
  final bool isLoading;
  final bool hasLoaded;
  final String? loadErrorMessage;
  final String? actionErrorMessage;

  /// Applies [filter] and a case-insensitive search over `actorName` and
  /// `message`, the same way `apps/web`'s `NotificationList` does.
  List<AppNotification> get visibleNotifications {
    final normalizedQuery = query.trim().toLowerCase();
    return notifications.where((notification) {
      if (!filter.matches(notification.type)) {
        return false;
      }
      if (normalizedQuery.isEmpty) {
        return true;
      }
      return notification.actorName.toLowerCase().contains(normalizedQuery) ||
          notification.message.toLowerCase().contains(normalizedQuery);
    }).toList();
  }

  bool get hasUnread => unreadCount > 0;

  bool get hasActiveFilterOrQuery =>
      filter != NotificationFilter.all || query.trim().isNotEmpty;

  NotificationsState copyWith({
    List<AppNotification>? notifications,
    int? unreadCount,
    NotificationFilter? filter,
    String? query,
    bool? isLoading,
    bool? hasLoaded,
    ValueGetter<String?>? loadErrorMessage,
    ValueGetter<String?>? actionErrorMessage,
  }) {
    return NotificationsState(
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
      filter: filter ?? this.filter,
      query: query ?? this.query,
      isLoading: isLoading ?? this.isLoading,
      hasLoaded: hasLoaded ?? this.hasLoaded,
      loadErrorMessage:
          loadErrorMessage != null ? loadErrorMessage() : this.loadErrorMessage,
      actionErrorMessage: actionErrorMessage != null
          ? actionErrorMessage()
          : this.actionErrorMessage,
    );
  }

  @override
  List<Object?> get props => [
        notifications,
        unreadCount,
        filter,
        query,
        isLoading,
        hasLoaded,
        loadErrorMessage,
        actionErrorMessage,
      ];
}
