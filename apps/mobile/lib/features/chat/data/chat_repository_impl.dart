import '../../../core/config/app_config.dart';
import '../../../core/storage/token_storage.dart';
import '../domain/entities/conversation.dart';
import '../domain/repositories/chat_repository.dart';
import 'chat_realtime_client.dart';
import 'chat_remote_data_source.dart';

class ChatRepositoryImpl implements ChatRepository {
  ChatRepositoryImpl({
    required ChatRemoteDataSource remoteDataSource,
    required AppConfig config,
    required TokenStorage tokenStorage,
  })  : _remoteDataSource = remoteDataSource,
        _realtimeClient = ChatRealtimeClient(
          config: config,
          tokenStorage: tokenStorage,
        );

  final ChatRemoteDataSource _remoteDataSource;
  final ChatRealtimeClient _realtimeClient;

  @override
  Future<List<Conversation>> getConversations(int userId) async {
    final conversations = await _remoteDataSource.getConversations(userId);
    return conversations.map((item) => item.toEntity()).toList();
  }

  @override
  Future<List<ChatMessage>> getMessages({
    required int conversationId,
    required int userId,
  }) async {
    final messages = await _remoteDataSource.getMessages(
      conversationId: conversationId,
      userId: userId,
    );
    return messages.map((item) => item.toEntity()).toList();
  }

  @override
  Future<void> sendMessage({
    required int conversationId,
    required int senderId,
    required String content,
  }) async {
    _realtimeClient.sendMessage(
      conversationId: conversationId,
      senderId: senderId,
      content: content,
    );
  }
}
