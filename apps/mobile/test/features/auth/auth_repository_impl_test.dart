import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/storage/token_storage.dart';
import 'package:weunite_mobile/features/auth/data/auth_remote_data_source.dart';
import 'package:weunite_mobile/features/auth/data/auth_repository_impl.dart';

import '../../fixtures/api_payloads.dart';

void main() {
  group('AuthRepositoryImpl.restoreSession', () {
    test('returns null and clears storage when the access token is expired',
        () async {
      final tokenStorage = _FakeTokenStorage();
      await tokenStorage.saveTokens(
        accessToken: 'expired-token',
        expiresAt: DateTime.now().subtract(const Duration(minutes: 1)),
      );
      await tokenStorage.saveUserJson('{"id": "7"}');
      final repository = AuthRepositoryImpl(
        remoteDataSource: AuthRemoteDataSource(Dio()),
        tokenStorage: tokenStorage,
      );

      final user = await repository.restoreSession();

      expect(user, isNull);
      expect(await tokenStorage.readAccessToken(), isNull);
      expect(await tokenStorage.readUserJson(), isNull);
    });

    test(
        'returns null and clears storage when there is a token but no '
        'stored user', () async {
      final tokenStorage = _FakeTokenStorage();
      await tokenStorage.saveTokens(accessToken: 'orphan-token');
      final repository = AuthRepositoryImpl(
        remoteDataSource: AuthRemoteDataSource(Dio()),
        tokenStorage: tokenStorage,
      );

      final user = await repository.restoreSession();

      expect(user, isNull);
      expect(await tokenStorage.readAccessToken(), isNull);
    });

    test(
        'returns null and clears storage for a legacy stored user with a '
        'numeric id', () async {
      final tokenStorage = _FakeTokenStorage();
      await tokenStorage.saveTokens(accessToken: 'valid-token');
      await tokenStorage.saveUserJson(
        jsonEncode({'id': 7, 'name': 'Matheus'}),
      );
      final repository = AuthRepositoryImpl(
        remoteDataSource: AuthRemoteDataSource(Dio()),
        tokenStorage: tokenStorage,
      );

      final user = await repository.restoreSession();

      expect(user, isNull);
      expect(await tokenStorage.readAccessToken(), isNull);
      expect(await tokenStorage.readUserJson(), isNull);
    });
  });

  group('AuthRepositoryImpl.login', () {
    test('saves the session and restoreSession round-trips the same user',
        () async {
      final tokenStorage = _FakeTokenStorage();
      final repository = AuthRepositoryImpl(
        remoteDataSource: AuthRemoteDataSource(
          _dio({'/api/auth/login': responseDto(authJson)}),
        ),
        tokenStorage: tokenStorage,
      );

      final user = await repository.login(
        username: 'matheus',
        password: 'secret',
      );

      expect(user.id, 7);
      expect(user.name, 'Matheus Silva');
      expect(await tokenStorage.readAccessToken(), 'token');

      final restored = await AuthRepositoryImpl(
        remoteDataSource: AuthRemoteDataSource(Dio()),
        tokenStorage: tokenStorage,
      ).restoreSession();

      expect(restored, user);
    });

    test('throws AppException when the response has no jwt', () async {
      final repository = AuthRepositoryImpl(
        remoteDataSource: AuthRemoteDataSource(
          _dio({
            '/api/auth/login': responseDto({'user': userJson}),
          }),
        ),
        tokenStorage: _FakeTokenStorage(),
      );

      await expectLater(
        () => repository.login(username: 'matheus', password: 'secret'),
        throwsA(
          isA<AppException>().having(
            (error) => error.message,
            'message',
            'Resposta de login invalida.',
          ),
        ),
      );
    });
  });
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

Dio _dio(Map<String, Object?> responses) {
  return Dio(
    BaseOptions(
      baseUrl: 'http://localhost/api',
      headers: const {Headers.acceptHeader: Headers.jsonContentType},
    ),
  )..httpClientAdapter = _FakeAdapter(responses);
}

class _FakeAdapter implements HttpClientAdapter {
  const _FakeAdapter(this.responses);

  final Map<String, Object?> responses;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    if (!responses.containsKey(options.uri.path)) {
      return ResponseBody.fromString(
        jsonEncode({'message': 'not found'}),
        404,
        headers: {
          Headers.contentTypeHeader: [Headers.jsonContentType],
        },
      );
    }
    return ResponseBody.fromString(
      jsonEncode(responses[options.uri.path]),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}
