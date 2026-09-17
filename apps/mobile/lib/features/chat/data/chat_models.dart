import 'dart:convert';

import '../domain/entities/chat_realtime_event.dart';
import '../domain/entities/conversation.dart';

class ConversationDto {
  const ConversationDto({
    required this.id,
    required this.peerName,
    required this.peerUsername,
    this.peerAvatar,
    this.lastMessage,
    this.unreadCount = 0,
  });

  factory ConversationDto.fromJson(Map<String, dynamic> json) {
    final peer = (json['recipient'] as Map?)?.cast<String, dynamic>() ??
        (json['user'] as Map?)?.cast<String, dynamic>() ??
        {};

    return ConversationDto(
      id: int.tryParse(json['id']?.toString() ?? '') ?? 0,
      peerName:
          peer['name']?.toString() ?? peer['username']?.toString() ?? 'Contato',
      peerUsername: peer['username']?.toString() ?? '',
      peerAvatar: peer['profileImg']?.toString(),
      lastMessage: (json['lastMessage'] as Map?)?['content']?.toString(),
      unreadCount: int.tryParse(json['unreadCount']?.toString() ?? '') ?? 0,
    );
  }

  final int id;
  final String peerName;
  final String peerUsername;
  final String? peerAvatar;
  final String? lastMessage;
  final int unreadCount;

  Conversation toEntity() {
    return Conversation(
      id: id,
      peerName: peerName,
      peerUsername: peerUsername,
      peerAvatar: peerAvatar,
      lastMessage: lastMessage,
      unreadCount: unreadCount,
    );
  }
}

ChatMessageType _parseMessageType(dynamic value) {
  switch (value?.toString()) {
    case 'IMAGE':
      return ChatMessageType.image;
    case 'FILE':
      return ChatMessageType.file;
    default:
      return ChatMessageType.text;
  }
}

class ChatMessageDto {
  const ChatMessageDto({
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

  factory ChatMessageDto.fromJson(Map<String, dynamic> json) {
    return ChatMessageDto(
      id: int.tryParse(json['id']?.toString() ?? '') ?? 0,
      conversationId:
          int.tryParse(json['conversationId']?.toString() ?? '') ?? 0,
      senderId: int.tryParse(json['senderId']?.toString() ?? '') ?? 0,
      content: json['content']?.toString() ?? '',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
      type: _parseMessageType(json['type']),
      read: json['isRead'] == true,
      readAt: json['readAt'] == null
          ? null
          : DateTime.tryParse(json['readAt'].toString()),
      deleted: json['deleted'] == true,
      edited: json['edited'] == true,
      editedAt: json['editedAt'] == null
          ? null
          : DateTime.tryParse(json['editedAt'].toString()),
    );
  }

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

  ChatMessage toEntity() {
    return ChatMessage(
      id: id,
      conversationId: conversationId,
      senderId: senderId,
      content: content,
      createdAt: createdAt,
      type: type,
      read: read,
      readAt: readAt,
      deleted: deleted,
      edited: edited,
      editedAt: editedAt,
    );
  }
}

class SendMessageRequestDto {
  const SendMessageRequestDto({
    required this.conversationId,
    required this.senderId,
    required this.content,
  });

  final int conversationId;
  final int senderId;
  final String content;

  Map<String, Object> toJson() => {
        'conversationId': conversationId,
        'senderId': senderId,
        'content': content,
        'type': 'TEXT',
      };
}

/// Returns null for a malformed body or an unknown event shape.
ChatRealtimeEvent? parseChatRealtimeEvent(String body) {
  Object? decoded;
  try {
    decoded = jsonDecode(body);
  } on FormatException {
    return null;
  }

  if (decoded is! Map) {
    return null;
  }
  final json = decoded.cast<String, dynamic>();

  if (json['type'] == 'DELETE') {
    final messageId = int.tryParse(json['messageId']?.toString() ?? '');
    if (messageId == null) {
      return null;
    }
    return ChatMessageDeleted(messageId: messageId);
  }

  final id = int.tryParse(json['id']?.toString() ?? '');
  if (id == null || id <= 0) {
    return null;
  }

  final message = ChatMessageDto.fromJson(json).toEntity();
  return message.edited
      ? ChatMessageEdited(message)
      : ChatMessageReceived(message);
}
