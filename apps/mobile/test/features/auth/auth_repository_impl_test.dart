import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/storage/token_storage.dart';
import 'package:weunite_mobile/features/auth/data/auth_remote_data_source.dart';
import 'package:weunite_mobile/features/auth/data/auth_repository_impl.dart';

void main() {
  group('AuthRepositoryImpl.restoreSession', () {
    test('returns null and clears storage when the access token is expired',
        () async {
      final tokenStorage = _FakeTokenStorage();
      await tokenStorage.saveTokens(
        accessToken: 'expired-token',
        expiresAt: DateTime.now().subtract(const Duration(minutes: 1)),
      );
      await tokenStorage.saveUserJson('{"id": 7}');
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
