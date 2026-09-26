import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import 'package:weunite_mobile/core/config/app_config.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/storage/token_storage.dart';
import 'package:weunite_mobile/features/chat/data/chat_realtime_client.dart';
import 'package:weunite_mobile/features/chat/domain/entities/chat_realtime_event.dart';

class _SentFrame {
  _SentFrame(this.destination, this.body);

  final String destination;
  final String? body;
}

class _FakeStompClient implements StompClient {
  _FakeStompClient(this.config);

  @override
  final StompConfig config;

  @override
  bool connected = false;

  @override
  bool get isActive => connected;

  int activateCalls = 0;
  int deactivateCalls = 0;
  final List<MapEntry<String, StompFrameCallback>> subscriptions = [];
  final List<String> unsubscribedDestinations = [];
  final List<_SentFrame> sentFrames = [];

  @override
  void activate() {
    activateCalls++;
  }

  @override
  void deactivate() {
    deactivateCalls++;
  }

  @override
  StompUnsubscribe subscribe({
    required String destination,
    required StompFrameCallback callback,
    Map<String, String>? headers,
  }) {
    subscriptions.add(MapEntry(destination, callback));
    return ({Map<String, String>? unsubscribeHeaders}) {
      unsubscribedDestinations.add(destination);
    };
  }

  @override
  void send({
    required String destination,
    Map<String, String>? headers,
    String? body,
    Uint8List? binaryBody,
  }) {
    sentFrames.add(_SentFrame(destination, body));
  }

  @override
  void ack({required String id, Map<String, String>? headers}) =>
      throw UnimplementedError();

  @override
  void nack({required String id, Map<String, String>? headers}) =>
      throw UnimplementedError();
}

class _StompClientFactorySpy {
  final List<_FakeStompClient> clients = [];

  StompClient call(StompConfig config) {
    final client = _FakeStompClient(config);
    clients.add(client);
    return client;
  }
}

class _FakeTokenStorage implements TokenStorage {
  _FakeTokenStorage({this.token = 't1', this.expiresAt});

  String? token;
  DateTime? expiresAt;

  @override
  Future<String?> readAccessToken() async => token;

  @override
  Future<String?> readRefreshToken() async => null;

  @override
  Future<String?> readUserJson() async => null;

  @override
  Future<DateTime?> readAccessTokenExpiresAt() async => expiresAt;

  @override
  Future<void> saveTokens({
    required String accessToken,
    String? refreshToken,
    DateTime? expiresAt,
  }) async {}

  @override
  Future<void> saveUserJson(String userJson) async {}

  @override
  Future<void> clear() async {}
}

const _config = AppConfig(
  apiBaseUrl: 'http://localhost/api',
  websocketBaseUrl: 'http://localhost/ws',
);

void _simulateConnected(_FakeStompClient client) {
  client.connected = true;
  client.config.onConnect(StompFrame(command: 'CONNECTED'));
}

Map<String, Object?> _messageJson({
  int id = 55,
  int conversationId = 30,
  bool edited = false,
}) {
  return {
    'id': id,
    'conversationId': conversationId,
    'senderId': 9,
    'content': 'Oi!',
    'isRead': false,
    'createdAt': '2026-09-15T12:10:00Z',
    'type': 'TEXT',
    'deleted': false,
    'edited': edited,
  };
}

void main() {
  group('ChatRealtimeClient', () {
    test(
        'sendMessage json-encodes content with quotes, backslash and '
        'newline', () async {
      final factory = _StompClientFactorySpy();
      final client = ChatRealtimeClient(
        config: _config,
        tokenStorage: _FakeTokenStorage(),
        clientFactory: factory.call,
        initialReconnectDelay: const Duration(milliseconds: 1),
        maxReconnectDelay: const Duration(milliseconds: 5),
        log: (_) {},
      );

      await client.connect();
      _simulateConnected(factory.clients.single);

      const content = 'diz "oi" \\ fim\nlinha 2';
      client.sendMessage(conversationId: 1, senderId: 2, content: content);

      final sent = factory.clients.single.sentFrames.single;
      expect(sent.destination, '/app/chat.sendMessage');
      expect(
        (jsonDecode(sent.body!) as Map)['content'],
        content,
      );

      await client.disconnect();
    });

    test('sendMessage while disconnected throws AppException', () {
      final factory = _StompClientFactorySpy();
      final client = ChatRealtimeClient(
        config: _config,
        tokenStorage: _FakeTokenStorage(),
        clientFactory: factory.call,
        log: (_) {},
      );

      expect(
        () => client.sendMessage(
          conversationId: 1,
          senderId: 2,
          content: 'oi',
        ),
        throwsA(isA<AppException>()),
      );
    });

    test(
        'subscribeConversation subscribes to the conversation topic and '
        'ignores malformed events', () async {
      final factory = _StompClientFactorySpy();
      final client = ChatRealtimeClient(
        config: _config,
        tokenStorage: _FakeTokenStorage(),
        clientFactory: factory.call,
        log: (_) {},
      );

      final events = <ChatRealtimeEvent>[];
      final sub = client.subscribeConversation(30).listen(events.add);
      await Future<void>.delayed(Duration.zero);
      _simulateConnected(factory.clients.single);

      expect(
        factory.clients.single.subscriptions.single.key,
        '/topic/conversation/30',
      );

      final callback = factory.clients.single.subscriptions.single.value;
      callback(
        StompFrame(command: 'MESSAGE', body: jsonEncode(_messageJson())),
      );
      callback(StompFrame(command: 'MESSAGE', body: 'not json'));
      await Future<void>.delayed(Duration.zero);

      expect(events, hasLength(1));
      expect(events.single, isA<ChatMessageReceived>());

      await sub.cancel();
      await client.disconnect();
    });

    test('canceling the subscription unsubscribes', () async {
      final factory = _StompClientFactorySpy();
      final client = ChatRealtimeClient(
        config: _config,
        tokenStorage: _FakeTokenStorage(),
        clientFactory: factory.call,
        log: (_) {},
      );

      final sub = client.subscribeConversation(30).listen((_) {});
      await Future<void>.delayed(Duration.zero);
      _simulateConnected(factory.clients.single);

      await sub.cancel();

      expect(
        factory.clients.single.unsubscribedDestinations,
        ['/topic/conversation/30'],
      );

      await client.disconnect();
    });

    test(
        'reconnects with a fresh client, rereading the token, resubscribing '
        'and emitting ChatRealtimeReconnected', () async {
      final tokenStorage = _FakeTokenStorage(token: 't1');
      final factory = _StompClientFactorySpy();
      final client = ChatRealtimeClient(
        config: _config,
        tokenStorage: tokenStorage,
        clientFactory: factory.call,
        initialReconnectDelay: const Duration(milliseconds: 1),
        maxReconnectDelay: const Duration(milliseconds: 5),
        log: (_) {},
      );

      final events = <ChatRealtimeEvent>[];
      final sub = client.subscribeConversation(30).listen(events.add);
      await Future<void>.delayed(Duration.zero);
      _simulateConnected(factory.clients.single);

      tokenStorage.token = 't2';
      factory.clients.single.config.onWebSocketDone();

      await Future<void>.delayed(const Duration(milliseconds: 50));

      expect(factory.clients, hasLength(2));
      final newClient = factory.clients.last;
      expect(
        newClient.config.stompConnectHeaders?['Authorization'],
        'Bearer t2',
      );

      _simulateConnected(newClient);
      await Future<void>.delayed(Duration.zero);

      expect(newClient.subscriptions.single.key, '/topic/conversation/30');
      expect(events.whereType<ChatRealtimeReconnected>(), hasLength(1));

      await sub.cancel();
      await client.disconnect();
    });

    test(
        'disconnect deactivates, closes streams and ignores a late '
        'onWebSocketDone from the old client', () async {
      final factory = _StompClientFactorySpy();
      final client = ChatRealtimeClient(
        config: _config,
        tokenStorage: _FakeTokenStorage(),
        clientFactory: factory.call,
        initialReconnectDelay: const Duration(milliseconds: 1),
        maxReconnectDelay: const Duration(milliseconds: 5),
        log: (_) {},
      );

      var done = false;
      final sub = client.subscribeConversation(30).listen(
            (_) {},
            onDone: () => done = true,
          );
      await Future<void>.delayed(Duration.zero);
      final firstClient = factory.clients.single;
      _simulateConnected(firstClient);

      await client.disconnect();

      expect(firstClient.deactivateCalls, greaterThanOrEqualTo(1));
      expect(done, isTrue);

      firstClient.config.onWebSocketDone();
      await Future<void>.delayed(const Duration(milliseconds: 20));

      expect(factory.clients, hasLength(1));

      await sub.cancel();
    });

    test('connect() does nothing when there is no token', () async {
      final factory = _StompClientFactorySpy();
      final client = ChatRealtimeClient(
        config: _config,
        tokenStorage: _FakeTokenStorage(token: null),
        clientFactory: factory.call,
        log: (_) {},
      );

      await client.connect();

      expect(factory.clients, isEmpty);
    });

    test('connect() does nothing when the stored token is expired', () async {
      final factory = _StompClientFactorySpy();
      final client = ChatRealtimeClient(
        config: _config,
        tokenStorage: _FakeTokenStorage(
          expiresAt: DateTime.now().subtract(const Duration(minutes: 1)),
        ),
        clientFactory: factory.call,
        log: (_) {},
      );

      await client.connect();

      expect(factory.clients, isEmpty);
    });
  });
}
