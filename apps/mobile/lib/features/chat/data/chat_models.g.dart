// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MessageDto _$MessageDtoFromJson(Map<String, dynamic> json) => MessageDto(
      id: (json['id'] as num).toInt(),
      conversationId: (json['conversationId'] as num).toInt(),
      senderId: (json['senderId'] as num).toInt(),
      content: json['content'] as String,
      isRead: json['isRead'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      readAt: json['readAt'] == null
          ? null
          : DateTime.parse(json['readAt'] as String),
      type: $enumDecode(_$MessageTypeDtoEnumMap, json['type']),
      deleted: json['deleted'] as bool,
      edited: json['edited'] as bool,
      editedAt: json['editedAt'] == null
          ? null
          : DateTime.parse(json['editedAt'] as String),
    );

const _$MessageTypeDtoEnumMap = {
  MessageTypeDto.text: 'TEXT',
  MessageTypeDto.image: 'IMAGE',
  MessageTypeDto.file: 'FILE',
};

ConversationDto _$ConversationDtoFromJson(Map<String, dynamic> json) =>
    ConversationDto(
      id: (json['id'] as num).toInt(),
      participantIds: (json['participantIds'] as List<dynamic>)
          .map((e) => (e as num).toInt())
          .toList(),
      lastMessage: json['lastMessage'] == null
          ? null
          : MessageDto.fromJson(json['lastMessage'] as Map<String, dynamic>),
      unreadCount: (json['unreadCount'] as num).toInt(),
    );

MessageDeleteEventDto _$MessageDeleteEventDtoFromJson(
        Map<String, dynamic> json) =>
    MessageDeleteEventDto(
      type: json['type'] as String,
      messageId: (json['messageId'] as num).toInt(),
    );
