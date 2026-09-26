import 'package:flutter_secure_storage/flutter_secure_storage.dart';

abstract class TokenStorage {
  Future<String?> readAccessToken();
  Future<String?> readRefreshToken();
  Future<String?> readUserJson();
  Future<DateTime?> readAccessTokenExpiresAt();
  Future<void> saveTokens({
    required String accessToken,
    String? refreshToken,
    DateTime? expiresAt,
  });
  Future<void> saveUserJson(String userJson);
  Future<void> clear();
}

class SecureTokenStorage implements TokenStorage {
  SecureTokenStorage({
    FlutterSecureStorage? storage,
  }) : _storage = storage ?? const FlutterSecureStorage();

  static const _accessTokenKey = 'weunite.access_token';
  static const _refreshTokenKey = 'weunite.refresh_token';
  static const _userJsonKey = 'weunite.user_json';
  static const _accessTokenExpiresAtKey = 'weunite.access_token_expires_at';

  final FlutterSecureStorage _storage;

  @override
  Future<String?> readAccessToken() => _storage.read(key: _accessTokenKey);

  @override
  Future<String?> readRefreshToken() => _storage.read(key: _refreshTokenKey);

  @override
  Future<String?> readUserJson() => _storage.read(key: _userJsonKey);

  @override
  Future<DateTime?> readAccessTokenExpiresAt() async {
    final value = await _storage.read(key: _accessTokenExpiresAtKey);
    if (value == null) {
      return null;
    }
    return DateTime.tryParse(value);
  }

  @override
  Future<void> saveTokens({
    required String accessToken,
    String? refreshToken,
    DateTime? expiresAt,
  }) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    if (refreshToken != null) {
      await _storage.write(key: _refreshTokenKey, value: refreshToken);
    }
    if (expiresAt != null) {
      await _storage.write(
        key: _accessTokenExpiresAtKey,
        value: expiresAt.toIso8601String(),
      );
    }
  }

  @override
  Future<void> saveUserJson(String userJson) {
    return _storage.write(key: _userJsonKey, value: userJson);
  }

  @override
  Future<void> clear() => _storage.deleteAll();
}
