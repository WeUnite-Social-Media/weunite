import 'dart:convert';

import 'package:json_annotation/json_annotation.dart';

import '../../../core/contracts/user_dto.dart';
import '../domain/entities/chat_realtime_event.dart';
import '../domain/entities/conversation.dart';

part 'chat_models.g.dart';

/// `MessageDTO.type` (openapi: components.schemas.MessageDTO).
enum MessageTypeDto {
  @JsonValue('TEXT')
  text,
  @JsonValue('IMAGE')
  image,
  @JsonValue('FILE')
  file,
}

/// Subset of `MessageDTO` (openapi: components.schemas.MessageDTO).
@JsonSerializable()
class MessageDto {
  const MessageDto({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.content,
    required this.isRead,
    required this.createdAt,
    this.readAt,
    required this.type,
    required this.deleted,
    required this.edited,
    this.editedAt,
  });

  factory MessageDto.fromJson(Map<String, dynamic> json) =>
      _$MessageDtoFromJson(json);

  final int id;
  final int conversationId;
  final int senderId;
  final String content;

  /// The Java record annotates the field `@JsonProperty("isRead")`; some
  /// Jackson versions also emit a bare `read` key, which is ignored (D15).
  final bool isRead;
  final DateTime createdAt;
  final DateTime? readAt;
  final MessageTypeDto type;
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
      type: switch (type) {
        MessageTypeDto.text => ChatMessageType.text,
        MessageTypeDto.image => ChatMessageType.image,
        MessageTypeDto.file => ChatMessageType.file,
      },
      read: isRead,
      readAt: readAt,
      deleted: deleted,
      edited: edited,
      editedAt: editedAt,
    );
  }
}

/// Subset of `ConversationDTO` (openapi:
/// components.schemas.ConversationDTO). The API has no notion of "the
/// other participant"; the peer is resolved client-side, like `apps/web`.
@JsonSerializable()
class ConversationDto {
  const ConversationDto({
    required this.id,
    required this.participantIds,
    this.lastMessage,
    required this.unreadCount,
  });

  factory ConversationDto.fromJson(Map<String, dynamic> json) =>
      _$ConversationDtoFromJson(json);

  final int id;
  final List<int> participantIds;
  final MessageDto? lastMessage;
  final int unreadCount;

  /// The first participant id that isn't [currentUserId], or `null` when
  /// none is found (a conversation with only the current user in it).
  int? peerUserIdFor(int currentUserId) {
    for (final id in participantIds) {
      if (id != currentUserId) {
        return id;
      }
    }
    return null;
  }

  Conversation toEntity({int? peerUserId, UserDto? peer}) {
    return Conversation(
      id: id,
      peerUserId: peerUserId,
      peerName: peer?.name,
      peerUsername: peer?.username,
      peerAvatar: peer?.profileImg,
      lastMessage: lastMessage?.content,
      unreadCount: unreadCount,
    );
  }
}

/// STOMP delete event pushed to `/topic/conversation/{id}`
/// (`ChatController.java`); not part of the OpenAPI spec (D13).
@JsonSerializable()
class MessageDeleteEventDto {
  const MessageDeleteEventDto({required this.type, required this.messageId});

  factory MessageDeleteEventDto.fromJson(Map<String, dynamic> json) =>
      _$MessageDeleteEventDtoFromJson(json);

  final String type;
  final int messageId;
}

/// STOMP payload sent to `/app/chat.sendMessage`; not part of the OpenAPI
/// spec (D13), typed by hand from `SendMessageRequestDTO`.
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
  try {
    final decoded = jsonDecode(body);
    if (decoded is! Map<String, dynamic>) {
      return null;
    }

    if (decoded['type'] == 'DELETE') {
      final event = MessageDeleteEventDto.fromJson(decoded);
      return ChatMessageDeleted(messageId: event.messageId);
    }

    final message = MessageDto.fromJson(decoded).toEntity();
    return message.edited
        ? ChatMessageEdited(message)
        : ChatMessageReceived(message);
  } on FormatException {
    return null;
  } on TypeError {
    return null;
  } on ArgumentError {
    return null;
  }
}
