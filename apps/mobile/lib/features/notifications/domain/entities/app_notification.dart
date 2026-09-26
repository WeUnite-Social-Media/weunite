import 'package:equatable/equatable.dart';

import 'notification_type.dart';

class AppNotification extends Equatable {
  const AppNotification({
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

  final int id;
  final int userId;
  final NotificationType type;
  final int actorId;
  final String actorName;
  final String actorUsername;
  final String? actorProfileImg;
  final int relatedEntityId;
  final String message;
  final bool isRead;
  final DateTime createdAt;

  AppNotification copyWith({bool? isRead}) {
    return AppNotification(
      id: id,
      userId: userId,
      type: type,
      actorId: actorId,
      actorName: actorName,
      actorUsername: actorUsername,
      actorProfileImg: actorProfileImg,
      relatedEntityId: relatedEntityId,
      message: message,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        type,
        actorId,
        actorName,
        actorUsername,
        actorProfileImg,
        relatedEntityId,
        message,
        isRead,
        createdAt,
      ];
}
