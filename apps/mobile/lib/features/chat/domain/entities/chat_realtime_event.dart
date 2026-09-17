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

/// Emitted after a reconnection, so the consumer resyncs via REST.
final class ChatRealtimeReconnected extends ChatRealtimeEvent {
  const ChatRealtimeReconnected();
}
