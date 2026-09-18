import 'package:equatable/equatable.dart';

class Conversation extends Equatable {
  const Conversation({
    required this.id,
    this.peerUserId,
    this.peerName,
    this.peerUsername,
    this.peerAvatar,
    this.lastMessage,
    this.lastMessageAt,
    this.lastMessageType = ChatMessageType.text,
    this.unreadCount = 0,
  });

  final int id;
  final int? peerUserId;
  final String? peerName;
  final String? peerUsername;
  final String? peerAvatar;
  final String? lastMessage;

  /// When the last message arrived (used for the list preview and sorting).
  final DateTime? lastMessageAt;
  final ChatMessageType lastMessageType;
  final int unreadCount;

  Conversation copyWith({
    String? lastMessage,
    DateTime? lastMessageAt,
    ChatMessageType? lastMessageType,
    int? unreadCount,
  }) {
    return Conversation(
      id: id,
      peerUserId: peerUserId,
      peerName: peerName,
      peerUsername: peerUsername,
      peerAvatar: peerAvatar,
      lastMessage: lastMessage ?? this.lastMessage,
      lastMessageAt: lastMessageAt ?? this.lastMessageAt,
      lastMessageType: lastMessageType ?? this.lastMessageType,
      unreadCount: unreadCount ?? this.unreadCount,
    );
  }

  @override
  List<Object?> get props => [
        id,
        peerUserId,
        peerName,
        peerUsername,
        peerAvatar,
        lastMessage,
        lastMessageAt,
        lastMessageType,
        unreadCount,
      ];
}

enum ChatMessageType { text, image, file }

class ChatMessage extends Equatable {
  const ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.content,
    required this.createdAt,
    this.type = ChatMessageType.text,
    this.read = false,
    this.readAt,
    this.deleted = false,
    this.edited = false,
    this.editedAt,
  });

  final int id;
  final int conversationId;
  final int senderId;
  final String content;
  final DateTime createdAt;
  final ChatMessageType type;
  final bool read;
  final DateTime? readAt;
  final bool deleted;
  final bool edited;
  final DateTime? editedAt;

  ChatMessage copyWith({
    String? content,
    bool? deleted,
    bool? edited,
    DateTime? editedAt,
    bool? read,
  }) {
    return ChatMessage(
      id: id,
      conversationId: conversationId,
      senderId: senderId,
      content: content ?? this.content,
      createdAt: createdAt,
      type: type,
      read: read ?? this.read,
      readAt: readAt,
      deleted: deleted ?? this.deleted,
      edited: edited ?? this.edited,
      editedAt: editedAt ?? this.editedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        conversationId,
        senderId,
        content,
        createdAt,
        type,
        read,
        readAt,
        deleted,
        edited,
        editedAt,
      ];
}
