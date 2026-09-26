import 'dart:convert';

import '../../../core/config/app_config.dart';
import '../../../core/error/app_exception.dart';
import '../../../core/realtime/realtime_client.dart';
import '../../../core/storage/token_storage.dart';
import '../domain/entities/chat_realtime_event.dart';
import 'chat_models.dart';

export '../../../core/realtime/realtime_client.dart' show StompClientFactory;

/// Chat-typed wrapper over [RealtimeClient]: keeps the public API the chat
/// feature already depends on (`subscribeConversation`,
/// `subscribeConversationRead`, `sendMessage`, `sendReadReceipt`, `connect`,
/// `disconnect`, `isConnected`), while the generic STOMP mechanics
/// (connect/reconnect/subscribe/send) live in `RealtimeClient`.
///
/// The API only publishes on `/topic/conversation/{id}` — new messages,
/// edits, and deletions all arrive on that same topic; see
/// `parseChatRealtimeEvent` for how they're told apart.
class ChatRealtimeClient {
  /// Pass [client] to share one STOMP connection with the rest of the app
  /// (that is what `bootstrap()` does, so chat and notifications ride the same
  /// socket, like the web's single `useAppWebSocket`). Without it, this owns a
  /// connection of its own, which keeps the existing tests constructing it
  /// directly working unchanged.
  ChatRealtimeClient({
    required AppConfig config,
    required TokenStorage tokenStorage,
    RealtimeClient? client,
    StompClientFactory? clientFactory,
    Duration initialReconnectDelay = const Duration(seconds: 1),
    Duration maxReconnectDelay = const Duration(seconds: 30),
    void Function(String message)? log,
  }) : _client = client ??
            RealtimeClient(
              config: config,
              tokenStorage: tokenStorage,
              clientFactory: clientFactory,
              initialReconnectDelay: initialReconnectDelay,
              maxReconnectDelay: maxReconnectDelay,
              log: log,
            );

  final RealtimeClient _client;

  bool get isConnected => _client.isConnected;

  Future<void> connect() => _client.connect();

  Stream<ChatRealtimeEvent> subscribeConversation(int conversationId) {
    return _client.subscribe<ChatRealtimeEvent>(
      '/topic/conversation/$conversationId',
      parseChatRealtimeEvent,
      onReconnect: () => const ChatRealtimeReconnected(),
    );
  }

  /// `/topic/conversation/{id}/read` carries only the reader's id, so it gets
  /// its own parser instead of [parseChatRealtimeEvent].
  Stream<ChatRealtimeEvent> subscribeConversationRead(int conversationId) {
    return _client.subscribe<ChatRealtimeEvent>(
      '/topic/conversation/$conversationId/read',
      (body) {
        final readerUserId = int.tryParse(body.trim());
        return readerUserId == null
            ? null
            : ChatConversationRead(readerUserId: readerUserId);
      },
      onReconnect: () => const ChatRealtimeReconnected(),
    );
  }

  /// Tells the API over STOMP that [userId] read the conversation. The REST
  /// call already persists it; this is what makes the API broadcast the
  /// receipt to the other participant, so their ticks turn green live.
  /// Best-effort: a disconnected socket is not an error here.
  void sendReadReceipt({required int conversationId, required int userId}) {
    if (!_client.isConnected) {
      return;
    }
    try {
      _client.send(
        destination: '/app/chat.markAsRead',
        body: jsonEncode({'conversationId': conversationId, 'userId': userId}),
      );
    } on AppException {
      // Dropped in between; the REST call already persisted the read.
    }
  }

  void sendMessage({
    required int conversationId,
    required int senderId,
    required String content,
    MessageTypeDto type = MessageTypeDto.text,
  }) {
    _client.send(
      destination: '/app/chat.sendMessage',
      body: jsonEncode(
        SendMessageRequestDto(
          conversationId: conversationId,
          senderId: senderId,
          content: content,
          type: type,
        ).toJson(),
      ),
    );
  }

  Future<void> disconnect() => _client.disconnect();
}
