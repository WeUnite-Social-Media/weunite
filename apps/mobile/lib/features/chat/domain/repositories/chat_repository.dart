import '../entities/chat_realtime_event.dart';
import '../entities/conversation.dart';

abstract class ChatRepository {
  Future<List<Conversation>> getConversations();
  Future<Conversation> getConversation(int conversationId);
  Future<List<ChatMessage>> getMessages({required int conversationId});
  Stream<ChatRealtimeEvent> watchConversation(int conversationId);
  Future<void> sendMessage({
    required int conversationId,
    required String content,
  });

  /// Uploads [imagePath] and sends it as an image message.
  Future<void> sendImage({
    required int conversationId,
    required String imagePath,
  });

  /// Opens (or creates) the 1:1 conversation with [userId]. The API returns
  /// the existing conversation when there already is one.
  Future<Conversation> startConversationWith(int userId);

  /// Read receipts for the conversation: emits when the other participant
  /// reads it, so my own messages can show as seen without a refetch.
  Stream<ChatRealtimeEvent> watchConversationRead(int conversationId);

  /// Marks the peer's messages in the conversation as read.
  Future<void> markConversationAsRead(int conversationId);
  Future<void> disconnectRealtime();
}
