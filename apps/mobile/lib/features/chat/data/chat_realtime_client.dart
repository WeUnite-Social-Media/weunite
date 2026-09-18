import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';

import '../../../core/config/app_config.dart';
import '../../../core/error/app_exception.dart';
import '../../../core/storage/token_storage.dart';
import '../domain/entities/chat_realtime_event.dart';
import 'chat_models.dart';

typedef StompClientFactory = StompClient Function(StompConfig config);

class _TopicSubscription {
  _TopicSubscription(this.destination, {this.parse});

  final String destination;

  /// Parser for topics that do not carry a message payload; defaults to
  /// [parseChatRealtimeEvent].
  final ChatRealtimeEvent? Function(String body)? parse;
  final StreamController<ChatRealtimeEvent> controller =
      StreamController<ChatRealtimeEvent>();
  StompUnsubscribe? unsubscribe;
}

class ChatRealtimeClient {
  ChatRealtimeClient({
    required AppConfig config,
    required TokenStorage tokenStorage,
    StompClientFactory? clientFactory,
    Duration initialReconnectDelay = const Duration(seconds: 1),
    Duration maxReconnectDelay = const Duration(seconds: 30),
    void Function(String message)? log,
  })  : _config = config,
        _tokenStorage = tokenStorage,
        _clientFactory = clientFactory ?? ((c) => StompClient(config: c)),
        _initialReconnectDelay = initialReconnectDelay,
        _maxReconnectDelay = maxReconnectDelay,
        _log = log ?? _defaultLog;

  final AppConfig _config;
  final TokenStorage _tokenStorage;
  final StompClientFactory _clientFactory;
  final Duration _initialReconnectDelay;
  final Duration _maxReconnectDelay;
  final void Function(String message) _log;

  StompClient? _client;
  bool _shouldConnect = false;
  int _generation = 0;
  Future<void>? _connecting;
  Timer? _reconnectTimer;
  int _reconnectAttempt = 0;
  bool _hasConnectedBefore = false;
  final Set<_TopicSubscription> _subscriptions = {};

  static void _defaultLog(String message) {
    if (kDebugMode) {
      debugPrint(message);
    }
  }

  bool get isConnected => _client?.connected ?? false;

  Future<void> connect() {
    _shouldConnect = true;
    return _connecting ??= _open().whenComplete(() => _connecting = null);
  }

  Future<void> _open() async {
    if (_client != null) {
      return;
    }
    final generation = _generation;

    final token = await _tokenStorage.readAccessToken();
    final expiresAt = await _tokenStorage.readAccessTokenExpiresAt();

    if (generation != _generation || !_shouldConnect) {
      return;
    }

    if (token == null ||
        token.isEmpty ||
        (expiresAt != null && expiresAt.isBefore(DateTime.now()))) {
      _log('[WS] no valid token, skipping connection');
      _shouldConnect = false;
      return;
    }

    late final StompClient client;
    client = _clientFactory(
      StompConfig.sockJS(
        url: _config.websocketBaseUrl,
        reconnectDelay: Duration.zero,
        stompConnectHeaders: {'Authorization': 'Bearer $token'},
        onConnect: (_) => _handleConnected(client),
        onStompError: (_) => _log('[WS] STOMP error frame received'),
        onWebSocketError: (error) {
          _log('[WS] socket error type=${error.runtimeType}');
          _handleConnectionLost(client);
        },
        onWebSocketDone: () => _handleConnectionLost(client),
      ),
    );

    _client = client;
    client.activate();
  }

  void _handleConnected(StompClient client) {
    if (!identical(client, _client)) {
      return;
    }
    _log('[WS] connected');
    final isReconnect = _hasConnectedBefore;
    _hasConnectedBefore = true;
    _reconnectAttempt = 0;

    for (final sub in _subscriptions) {
      _attach(sub);
      if (isReconnect) {
        sub.controller.add(const ChatRealtimeReconnected());
      }
    }
  }

  void _attach(_TopicSubscription sub) {
    if (_client?.connected != true) {
      return;
    }
    try {
      sub.unsubscribe?.call();
      sub.unsubscribe = _client!.subscribe(
        destination: sub.destination,
        callback: (frame) {
          final body = frame.body;
          if (body == null) {
            return;
          }
          final event = (sub.parse ?? parseChatRealtimeEvent)(body);
          if (event == null) {
            _log('[WS] ignored malformed event');
            return;
          }
          sub.controller.add(event);
        },
      );
    } on StompBadStateException {
      // Connection dropped between the connected callback and the
      // subscribe call; the next reconnect will retry.
    }
  }

  void _handleConnectionLost(StompClient client) {
    if (!identical(client, _client)) {
      return;
    }
    _client = null;
    client.deactivate();

    for (final sub in _subscriptions) {
      sub.unsubscribe = null;
    }

    if (_shouldConnect) {
      _scheduleReconnect();
    }
  }

  void _scheduleReconnect() {
    if (_reconnectTimer != null) {
      return;
    }
    final delayMs = min(
      _initialReconnectDelay.inMilliseconds * pow(2, _reconnectAttempt).toInt(),
      _maxReconnectDelay.inMilliseconds,
    );
    final delay = Duration(milliseconds: delayMs);
    _reconnectAttempt++;
    _log('[WS] reconnecting in ${delay.inSeconds}s');
    _reconnectTimer = Timer(delay, () {
      _reconnectTimer = null;
      if (_shouldConnect) {
        unawaited(connect());
      }
    });
  }

  Stream<ChatRealtimeEvent> subscribeConversation(int conversationId) {
    final sub = _TopicSubscription('/topic/conversation/$conversationId');
    sub.controller.onListen = () {
      _subscriptions.add(sub);
      _attach(sub);
      unawaited(connect());
    };
    sub.controller.onCancel = () {
      _subscriptions.remove(sub);
      sub.unsubscribe?.call();
      sub.unsubscribe = null;
    };
    return sub.controller.stream;
  }

  /// `/topic/conversation/{id}/read` carries only the reader's id, so it gets
  /// its own parser instead of [parseChatRealtimeEvent].
  Stream<ChatRealtimeEvent> subscribeConversationRead(int conversationId) {
    final sub = _TopicSubscription(
      '/topic/conversation/$conversationId/read',
      parse: (body) {
        final readerUserId = int.tryParse(body.trim());
        return readerUserId == null
            ? null
            : ChatConversationRead(readerUserId: readerUserId);
      },
    );
    sub.controller.onListen = () {
      _subscriptions.add(sub);
      _attach(sub);
      unawaited(connect());
    };
    sub.controller.onCancel = () {
      _subscriptions.remove(sub);
      sub.unsubscribe?.call();
      sub.unsubscribe = null;
    };
    return sub.controller.stream;
  }

  /// Tells the API over STOMP that [userId] read the conversation. The REST
  /// call already persists it; this is what makes the API broadcast the
  /// receipt to the other participant, so their ticks turn green live.
  /// Best-effort: a disconnected socket is not an error here.
  void sendReadReceipt({required int conversationId, required int userId}) {
    final client = _client;
    if (client == null || !client.connected) {
      return;
    }
    try {
      client.send(
        destination: '/app/chat.markAsRead',
        body: jsonEncode({'conversationId': conversationId, 'userId': userId}),
      );
    } on StompBadStateException {
      // Dropped in between; the REST call already persisted the read.
    }
  }

  void sendMessage({
    required int conversationId,
    required int senderId,
    required String content,
    MessageTypeDto type = MessageTypeDto.text,
  }) {
    final client = _client;
    if (client == null || !client.connected) {
      unawaited(connect());
      throw const AppException(
        'Chat desconectado. Tente novamente em instantes.',
      );
    }
    try {
      client.send(
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
    } on StompBadStateException {
      throw const AppException(
        'Chat desconectado. Tente novamente em instantes.',
      );
    }
  }

  Future<void> disconnect() async {
    _shouldConnect = false;
    _generation++;
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    _reconnectAttempt = 0;
    _hasConnectedBefore = false;

    final client = _client;
    _client = null;
    client?.deactivate();

    final subs = _subscriptions.toList();
    _subscriptions.clear();
    for (final sub in subs) {
      sub.unsubscribe = null;
      await sub.controller.close();
    }
    _log('[WS] disconnected');
  }
}
