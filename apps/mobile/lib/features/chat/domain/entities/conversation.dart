import 'package:equatable/equatable.dart';

class Conversation extends Equatable {
  const Conversation({
    required this.id,
    required this.peerName,
    required this.peerUsername,
    this.peerAvatar,
    this.lastMessage,
    this.unreadCount = 0,
  });

  final int id;
  final String peerName;
  final String peerUsername;
  final String? peerAvatar;
  final String? lastMessage;
  final int unreadCount;

  @override
  List<Object?> get props => [
        id,
        peerName,
        peerUsername,
        peerAvatar,
        lastMessage,
        unreadCount,
      ];
}

class ChatMessage extends Equatable {
  const ChatMessage({
    required this.id,
    required this.senderId,
    required this.content,
    required this.createdAt,
    this.read = false,
  });

  final int id;
  final int senderId;
  final String content;
  final DateTime createdAt;
  final bool read;

  @override
  List<Object?> get props => [id, senderId, content, createdAt, read];
}
