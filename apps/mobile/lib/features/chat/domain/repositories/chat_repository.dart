import '../entities/conversation.dart';

abstract class ChatRepository {
  Future<List<Conversation>> getConversations(int userId);
  Future<List<ChatMessage>> getMessages({
    required int conversationId,
    required int userId,
  });
  Future<void> sendMessage({
    required int conversationId,
    required int senderId,
    required String content,
  });
}
