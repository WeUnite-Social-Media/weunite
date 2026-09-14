import 'package:flutter_secure_storage/flutter_secure_storage.dart';

abstract class TokenStorage {
  Future<String?> readAccessToken();
  Future<String?> readRefreshToken();
  Future<String?> readUserJson();
  Future<void> saveTokens({required String accessToken, String? refreshToken});
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

  final FlutterSecureStorage _storage;

  @override
  Future<String?> readAccessToken() => _storage.read(key: _accessTokenKey);

  @override
  Future<String?> readRefreshToken() => _storage.read(key: _refreshTokenKey);

  @override
  Future<String?> readUserJson() => _storage.read(key: _userJsonKey);

  @override
  Future<void> saveTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    if (refreshToken != null) {
      await _storage.write(key: _refreshTokenKey, value: refreshToken);
    }
  }

  @override
  Future<void> saveUserJson(String userJson) {
    return _storage.write(key: _userJsonKey, value: userJson);
  }

  @override
  Future<void> clear() => _storage.deleteAll();
}
