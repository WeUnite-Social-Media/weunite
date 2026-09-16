import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/config/app_config.dart';
import 'package:weunite_mobile/core/network/api_client.dart';
import 'package:weunite_mobile/core/session/session_events.dart';
import 'package:weunite_mobile/core/storage/token_storage.dart';

void main() {
  group('ApiClient 401 handling', () {
    late _FakeTokenStorage tokenStorage;
    late SessionEvents sessionEvents;
    late ApiClient apiClient;

    setUp(() {
      tokenStorage = _FakeTokenStorage();
      sessionEvents = SessionEvents();
      apiClient = ApiClient(
        config: const AppConfig(
          apiBaseUrl: 'http://localhost/api',
          websocketBaseUrl: 'http://localhost/ws',
        ),
        tokenStorage: tokenStorage,
        sessionEvents: sessionEvents,
      );
    });

    tearDown(() => sessionEvents.dispose());

    test('401 on an authenticated route clears tokens and emits onExpired',
        () async {
      await tokenStorage.saveTokens(accessToken: 'stale-token');
      apiClient.dio.httpClientAdapter = _FakeAdapter(401);

      final expiredEvents = <void>[];
      final subscription = sessionEvents.onExpired.listen(expiredEvents.add);

      await expectLater(
        apiClient.dio.get<dynamic>('/feed/get'),
        throwsA(isA<DioException>()),
      );
      await Future<void>.delayed(Duration.zero);

      expect(await tokenStorage.readAccessToken(), isNull);
      expect(expiredEvents, hasLength(1));

      await subscription.cancel();
    });

    test('401 on /auth/login does not clear tokens nor emit onExpired',
        () async {
      await tokenStorage.saveTokens(accessToken: 'stale-token');
      apiClient.dio.httpClientAdapter = _FakeAdapter(401);

      final expiredEvents = <void>[];
      final subscription = sessionEvents.onExpired.listen(expiredEvents.add);

      await expectLater(
        apiClient.dio.post<dynamic>(
          '/auth/login',
          data: {'username': 'a', 'password': 'b'},
        ),
        throwsA(isA<DioException>()),
      );
      await Future<void>.delayed(Duration.zero);

      expect(await tokenStorage.readAccessToken(), 'stale-token');
      expect(expiredEvents, isEmpty);

      await subscription.cancel();
    });
  });
}

class _FakeAdapter implements HttpClientAdapter {
  _FakeAdapter(this.statusCode);

  final int statusCode;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    return ResponseBody.fromString(
      jsonEncode({'message': 'unauthorized'}),
      statusCode,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

class _FakeTokenStorage implements TokenStorage {
  String? _accessToken;
  String? _refreshToken;
  String? _userJson;
  DateTime? _expiresAt;

  @override
  Future<String?> readAccessToken() async => _accessToken;

  @override
  Future<String?> readRefreshToken() async => _refreshToken;

  @override
  Future<String?> readUserJson() async => _userJson;

  @override
  Future<DateTime?> readAccessTokenExpiresAt() async => _expiresAt;

  @override
  Future<void> saveTokens({
    required String accessToken,
    String? refreshToken,
    DateTime? expiresAt,
  }) async {
    _accessToken = accessToken;
    if (refreshToken != null) _refreshToken = refreshToken;
    if (expiresAt != null) _expiresAt = expiresAt;
  }

  @override
  Future<void> saveUserJson(String userJson) async {
    _userJson = userJson;
  }

  @override
  Future<void> clear() async {
    _accessToken = null;
    _refreshToken = null;
    _userJson = null;
    _expiresAt = null;
  }
}
