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
      peerName: peer['name']?.toString() ?? peer['username']?.toString() ?? 'Contato',
      peerUsername: peer['username']?.toString() ?? '',
      peerAvatar: peer['profileImg']?.toString(),
      lastMessage: json['lastMessage']?.toString(),
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

class ChatMessageDto {
  const ChatMessageDto({
    required this.id,
    required this.senderId,
    required this.content,
    required this.createdAt,
    this.read = false,
  });

  factory ChatMessageDto.fromJson(Map<String, dynamic> json) {
    final sender = (json['sender'] as Map?)?.cast<String, dynamic>() ?? {};

    return ChatMessageDto(
      id: int.tryParse(json['id']?.toString() ?? '') ?? 0,
      senderId: int.tryParse(
            (json['senderId'] ?? sender['id'] ?? '').toString(),
          ) ??
          0,
      content: json['content']?.toString() ?? json['message']?.toString() ?? '',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
      read: json['read'] == true,
    );
  }

  final int id;
  final int senderId;
  final String content;
  final DateTime createdAt;
  final bool read;

  ChatMessage toEntity() {
    return ChatMessage(
      id: id,
      senderId: senderId,
      content: content,
      createdAt: createdAt,
      read: read,
    );
  }
}
