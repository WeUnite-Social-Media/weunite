import 'notification_type.dart';

/// Client-side filter, mirroring `apps/web`'s
/// `features/notifications/types/notification.types.ts` `NotificationFilter`
/// and `notificationHelpers.ts` (`matchesNotificationFilter`,
/// `getNotificationFilterLabel`). Filtering and search happen entirely on
/// the client, on top of the one unpaginated list the API returns.
enum NotificationFilter {
  all,
  likes,
  comments,
  follows,
  messages,
  opportunities
}

extension NotificationFilterX on NotificationFilter {
  /// Exact labels used by the web app.
  String get label => switch (this) {
        NotificationFilter.all => 'Todas',
        NotificationFilter.likes => 'Curtidas',
        NotificationFilter.comments => 'Comentarios',
        NotificationFilter.follows => 'Seguidores',
        NotificationFilter.messages => 'Mensagens',
        NotificationFilter.opportunities => 'Oportunidades',
      };

  bool matches(NotificationType type) {
    return switch (this) {
      NotificationFilter.all => true,
      NotificationFilter.likes => type == NotificationType.postLike ||
          type == NotificationType.commentLike,
      NotificationFilter.comments => type == NotificationType.postComment ||
          type == NotificationType.commentReply,
      NotificationFilter.follows => type == NotificationType.newFollower,
      NotificationFilter.messages => type == NotificationType.newMessage,
      NotificationFilter.opportunities =>
        type == NotificationType.opportunitySubscription,
    };
  }
}
