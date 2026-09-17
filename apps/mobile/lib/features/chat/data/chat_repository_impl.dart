import '../../../core/session/current_user_provider.dart';
import '../domain/entities/chat_realtime_event.dart';
import '../domain/entities/conversation.dart';
import '../domain/repositories/chat_repository.dart';
import 'chat_realtime_client.dart';
import 'chat_remote_data_source.dart';

class ChatRepositoryImpl implements ChatRepository {
  ChatRepositoryImpl({
    required ChatRemoteDataSource remoteDataSource,
    required ChatRealtimeClient realtimeClient,
    required CurrentUserProvider currentUserProvider,
  })  : _remoteDataSource = remoteDataSource,
        _currentUserProvider = currentUserProvider,
        _realtimeClient = realtimeClient;

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
  Future<List<ChatMessage>> getMessages({required int conversationId}) async {
    final messages = await _remoteDataSource.getMessages(
      conversationId: conversationId,
      userId: _currentUserProvider.requireUserId(),
    );
    return messages.map((item) => item.toEntity()).toList();
  }

  @override
  Stream<ChatRealtimeEvent> watchConversation(int conversationId) {
    return _realtimeClient.subscribeConversation(conversationId);
  }

  @override
  Future<void> sendMessage({
    required int conversationId,
    required String content,
  }) async {
    _realtimeClient.sendMessage(
      conversationId: conversationId,
      senderId: _currentUserProvider.requireUserId(),
      content: content,
    );
  }

  @override
  Future<void> disconnectRealtime() {
    return _realtimeClient.disconnect();
  }
}
