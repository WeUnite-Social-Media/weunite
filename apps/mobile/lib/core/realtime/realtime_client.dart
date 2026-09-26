import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';

import '../config/app_config.dart';
import '../error/app_exception.dart';
import '../storage/token_storage.dart';

typedef StompClientFactory = StompClient Function(StompConfig config);

/// A subscription to one STOMP destination. Kept untyped internally (`T` is
/// erased to `Object?`) so heterogeneous subscriptions (chat, notifications,
/// ...) can share one `Set`; [RealtimeClient.subscribe] restores the type on
/// the returned stream.
class _Subscription {
  _Subscription(this.destination, this.parse, this.onReconnect);

  final String destination;

  /// Parses a raw STOMP frame body into the event to emit, or `null` to
  /// ignore a malformed/unrelated payload.
  final Object? Function(String body) parse;

  /// Builds the event to emit to this subscriber right after a reconnection,
  /// so it can resync (e.g. via REST) in case something was missed while
  /// disconnected. `null` means this subscription doesn't care.
  final Object? Function()? onReconnect;

  final StreamController<Object?> controller = StreamController<Object?>();
  StompUnsubscribe? unsubscribe;
}

/// Generic STOMP-over-SockJS client: single connection per instance, lazy
/// connect on first subscription, exponential-backoff reconnection, and
/// destination-scoped subscriptions that resubscribe automatically after a
/// reconnect.
///
/// Extracted from `features/chat/data/chat_realtime_client.dart`, which is
/// now a thin, chat-typed wrapper over this class. Behavior is unchanged.
class RealtimeClient {
  RealtimeClient({
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
  final Set<_Subscription> _subscriptions = {};

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
        final event = sub.onReconnect?.call();
        if (event != null) {
          sub.controller.add(event);
        }
      }
    }
  }

  void _attach(_Subscription sub) {
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
          final event = sub.parse(body);
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

  /// Subscribes to [destination]. [parse] converts each frame body into a
  /// `T`, returning `null` to ignore it; [onReconnect] (optional) builds the
  /// event emitted right after a reconnection, so the subscriber can resync.
  ///
  /// Connecting is lazy: the underlying socket only opens once something
  /// listens to the returned stream, and disconnects the STOMP subscription
  /// (without touching the socket) once nothing is listening anymore.
  Stream<T> subscribe<T>(
    String destination,
    T? Function(String body) parse, {
    T Function()? onReconnect,
  }) {
    final sub = _Subscription(
      destination,
      (body) => parse(body),
      onReconnect == null ? null : () => onReconnect(),
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
    return sub.controller.stream.cast<T>();
  }

  /// Sends [body] to [destination]. Best-effort in the sense that it does
  /// not queue anything while disconnected: it throws
  /// [AppException] immediately (and kicks off a reconnect attempt) instead.
  void send({required String destination, required String body}) {
    final client = _client;
    if (client == null || !client.connected) {
      unawaited(connect());
      throw const AppException(
        'Chat desconectado. Tente novamente em instantes.',
      );
    }
    try {
      client.send(destination: destination, body: body);
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
