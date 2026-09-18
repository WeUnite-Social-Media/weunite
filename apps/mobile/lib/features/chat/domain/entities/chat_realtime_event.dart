import 'conversation.dart';

sealed class ChatRealtimeEvent {
  const ChatRealtimeEvent();
}

final class ChatMessageReceived extends ChatRealtimeEvent {
  const ChatMessageReceived(this.message);

  final ChatMessage message;
}

final class ChatMessageEdited extends ChatRealtimeEvent {
  const ChatMessageEdited(this.message);

  final ChatMessage message;
}

final class ChatMessageDeleted extends ChatRealtimeEvent {
  const ChatMessageDeleted({required this.messageId});

  final int messageId;
}

/// The other participant read the conversation. The API broadcasts the
/// reader's id on `/topic/conversation/{id}/read` when someone marks it as
/// read over STOMP.
final class ChatConversationRead extends ChatRealtimeEvent {
  const ChatConversationRead({required this.readerUserId});

  final int readerUserId;
}

/// Emitted after a reconnection, so the consumer resyncs via REST.
final class ChatRealtimeReconnected extends ChatRealtimeEvent {
  const ChatRealtimeReconnected();
}
