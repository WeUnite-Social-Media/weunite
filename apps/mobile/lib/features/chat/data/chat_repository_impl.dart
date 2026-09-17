import '../../../core/contracts/user_dto.dart';
import '../../../core/error/app_exception.dart';
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
    final userId = _currentUserProvider.requireUserId();
    final dtos = await _remoteDataSource.getConversations(userId);
    final peerIds =
        dtos.map((dto) => dto.peerUserIdFor(userId)).whereType<int>().toSet();
    final peers = await _loadPeers(peerIds);
    return dtos.map((dto) {
      final peerId = dto.peerUserIdFor(userId);
      return dto.toEntity(
        peerUserId: peerId,
        peer: peerId == null ? null : peers[peerId],
      );
    }).toList();
  }

  @override
  Future<Conversation> getConversation(int conversationId) async {
    final userId = _currentUserProvider.requireUserId();
    final dto = await _remoteDataSource.getConversation(
      conversationId: conversationId,
      userId: userId,
    );
    final peerId = dto.peerUserIdFor(userId);
    final peer = peerId == null ? null : (await _loadPeers({peerId}))[peerId];
    return dto.toEntity(peerUserId: peerId, peer: peer);
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

  /// Fetches [ids] concurrently. A 404 (peer no longer accessible) resolves
  /// to `null` for that id instead of failing the whole lookup; any other
  /// error is rethrown.
  Future<Map<int, UserDto?>> _loadPeers(Set<int> ids) async {
    final entries = await Future.wait(
      ids.map((id) async {
        try {
          return MapEntry(id, await _remoteDataSource.getUser(id));
        } on AppException catch (error) {
          if (error.statusCode == 404) {
            return MapEntry<int, UserDto?>(id, null);
          }
          rethrow;
        }
      }),
    );
    return Map.fromEntries(entries);
  }
}
