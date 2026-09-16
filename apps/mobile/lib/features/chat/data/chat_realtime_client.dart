import 'package:stomp_dart_client/stomp_dart_client.dart';

import '../../../core/config/app_config.dart';
import '../../../core/storage/token_storage.dart';

class ChatRealtimeClient {
  ChatRealtimeClient({
    required AppConfig config,
    required TokenStorage tokenStorage,
  })  : _config = config,
        _tokenStorage = tokenStorage;

  final AppConfig _config;
  final TokenStorage _tokenStorage;
  StompClient? _client;

  Future<void> connect({
    required int userId,
    required void Function(String body) onMessage,
  }) async {
    final token = await _tokenStorage.readAccessToken();
    _client = StompClient(
      config: StompConfig.sockJS(
        url: _config.websocketBaseUrl,
        stompConnectHeaders: {
          if (token != null) 'Authorization': 'Bearer $token',
        },
        onConnect: (frame) {
          _client?.subscribe(
            destination: '/topic/user/$userId/messages',
            callback: (frame) {
              final body = frame.body;
              if (body != null) {
                onMessage(body);
              }
            },
          );
        },
      ),
    )..activate();
  }

  void sendMessage({
    required int conversationId,
    required int senderId,
    required String content,
  }) {
    _client?.send(
      destination: '/app/chat.sendMessage',
      body:
          '{"conversationId":$conversationId,"senderId":$senderId,"content":"$content"}',
    );
  }

  void disconnect() {
    _client?.deactivate();
    _client = null;
  }
}
