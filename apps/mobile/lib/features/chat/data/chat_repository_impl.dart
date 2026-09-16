import '../../../core/config/app_config.dart';
import '../../../core/session/current_user_provider.dart';
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
    required CurrentUserProvider currentUserProvider,
  })  : _remoteDataSource = remoteDataSource,
        _currentUserProvider = currentUserProvider,
        _realtimeClient = ChatRealtimeClient(
          config: config,
          tokenStorage: tokenStorage,
        );

  final ChatRemoteDataSource _remoteDataSource;
  final CurrentUserProvider _currentUserProvider;
  final ChatRealtimeClient _realtimeClient;

  @override
  Future<List<Conversation>> getConversations() async {
    final conversations = await _remoteDataSource.getConversations(
      _currentUserProvider.requireUserId(),
    );
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
