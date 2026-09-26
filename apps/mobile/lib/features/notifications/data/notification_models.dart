import 'package:json_annotation/json_annotation.dart';

import '../domain/entities/app_notification.dart';
import '../domain/entities/notification_type.dart';

part 'notification_models.g.dart';

/// `NotificationDTO.type` (backend `NotificationType` enum). [unknown] is a
/// deliberate exception to the "DTOs never default an invalid value" rule
/// (see `apps/mobile/AGENTS.md`): the task spec requires a new backend type
/// to not break parsing of the whole list.
@JsonEnum()
enum NotificationTypeDto {
  @JsonValue('POST_LIKE')
  postLike,
  @JsonValue('POST_COMMENT')
  postComment,
  @JsonValue('COMMENT_LIKE')
  commentLike,
  @JsonValue('COMMENT_REPLY')
  commentReply,
  @JsonValue('NEW_FOLLOWER')
  newFollower,
  @JsonValue('NEW_MESSAGE')
  newMessage,
  @JsonValue('POST_REPOST')
  postRepost,
  @JsonValue('OPPORTUNITY_SUBSCRIPTION')
  opportunitySubscription,
  unknown,
}

/// `NotificationDTO` (backend `NotificationController`/`NotificationDTO`).
@JsonSerializable()
class NotificationDto {
  const NotificationDto({
    required this.id,
    required this.userId,
    required this.type,
    required this.actorId,
    required this.actorName,
    required this.actorUsername,
    this.actorProfileImg,
    required this.relatedEntityId,
    required this.message,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationDto.fromJson(Map<String, dynamic> json) =>
      _$NotificationDtoFromJson(json);

  final int id;
  final int userId;

  @JsonKey(unknownEnumValue: NotificationTypeDto.unknown)
  final NotificationTypeDto type;
  final int actorId;
  final String actorName;
  final String actorUsername;
  final String? actorProfileImg;
  final int relatedEntityId;
  final String message;

  /// The Java record annotates the field `@JsonProperty("isRead")`.
  @JsonKey(name: 'isRead')
  final bool isRead;
  final DateTime createdAt;

  AppNotification toEntity() {
    return AppNotification(
      id: id,
      userId: userId,
      type: switch (type) {
        NotificationTypeDto.postLike => NotificationType.postLike,
        NotificationTypeDto.postComment => NotificationType.postComment,
        NotificationTypeDto.commentLike => NotificationType.commentLike,
        NotificationTypeDto.commentReply => NotificationType.commentReply,
        NotificationTypeDto.newFollower => NotificationType.newFollower,
        NotificationTypeDto.newMessage => NotificationType.newMessage,
        NotificationTypeDto.postRepost => NotificationType.postRepost,
        NotificationTypeDto.opportunitySubscription =>
          NotificationType.opportunitySubscription,
        NotificationTypeDto.unknown => NotificationType.unknown,
      },
      actorId: actorId,
      actorName: actorName,
      actorUsername: actorUsername,
      actorProfileImg: actorProfileImg,
      relatedEntityId: relatedEntityId,
      message: message,
      isRead: isRead,
      createdAt: createdAt,
    );
  }
}

/// `GET /notifications/user/{userId}/unread-count` — a raw
/// `{"unreadCount": <number>}` object, no envelope.
@JsonSerializable()
class UnreadCountDto {
  const UnreadCountDto({required this.unreadCount});

  factory UnreadCountDto.fromJson(Map<String, dynamic> json) =>
      _$UnreadCountDtoFromJson(json);

  final int unreadCount;
}
