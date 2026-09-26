// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

NotificationDto _$NotificationDtoFromJson(Map<String, dynamic> json) =>
    NotificationDto(
      id: (json['id'] as num).toInt(),
      userId: (json['userId'] as num).toInt(),
      type: $enumDecode(_$NotificationTypeDtoEnumMap, json['type'],
          unknownValue: NotificationTypeDto.unknown),
      actorId: (json['actorId'] as num).toInt(),
      actorName: json['actorName'] as String,
      actorUsername: json['actorUsername'] as String,
      actorProfileImg: json['actorProfileImg'] as String?,
      relatedEntityId: (json['relatedEntityId'] as num).toInt(),
      message: json['message'] as String,
      isRead: json['isRead'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

const _$NotificationTypeDtoEnumMap = {
  NotificationTypeDto.postLike: 'POST_LIKE',
  NotificationTypeDto.postComment: 'POST_COMMENT',
  NotificationTypeDto.commentLike: 'COMMENT_LIKE',
  NotificationTypeDto.commentReply: 'COMMENT_REPLY',
  NotificationTypeDto.newFollower: 'NEW_FOLLOWER',
  NotificationTypeDto.newMessage: 'NEW_MESSAGE',
  NotificationTypeDto.postRepost: 'POST_REPOST',
  NotificationTypeDto.opportunitySubscription: 'OPPORTUNITY_SUBSCRIPTION',
  NotificationTypeDto.unknown: 'unknown',
};

UnreadCountDto _$UnreadCountDtoFromJson(Map<String, dynamic> json) =>
    UnreadCountDto(
      unreadCount: (json['unreadCount'] as num).toInt(),
    );
