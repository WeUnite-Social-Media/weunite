import 'dart:convert';

import '../../../core/contracts/user_dto.dart';
import '../../../core/error/app_exception.dart';
import '../../../core/storage/token_storage.dart';
import '../domain/entities/app_user.dart';
import '../domain/repositories/auth_repository.dart';
import 'auth_models.dart';
import 'auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({
    required AuthRemoteDataSource remoteDataSource,
    required TokenStorage tokenStorage,
  })  : _remoteDataSource = remoteDataSource,
        _tokenStorage = tokenStorage;

  final AuthRemoteDataSource _remoteDataSource;
  final TokenStorage _tokenStorage;
  AppUser? _currentUser;

  @override
  AppUser? get currentUser => _currentUser;

  @override
  Future<AppUser?> restoreSession() async {
    final token = await _tokenStorage.readAccessToken();
    if (token == null || token.isEmpty) {
      return null;
    }
    final expiresAt = await _tokenStorage.readAccessTokenExpiresAt();
    if (expiresAt != null && expiresAt.isBefore(DateTime.now())) {
      await _tokenStorage.clear();
      return null;
    }
    final userJson = await _tokenStorage.readUserJson();
    if (userJson == null || userJson.isEmpty) {
      await _tokenStorage.clear();
      return null;
    }
    try {
      final user = UserDto.fromJson(
        jsonDecode(userJson) as Map<String, dynamic>,
      ).toAppUser();
      _currentUser = user;
      return user;
    } catch (_) {
      await _tokenStorage.clear();
      return null;
    }
  }

  @override
  Future<AppUser> login({
    required String username,
    required String password,
  }) async {
    final session = await _remoteDataSource.login(
      username: username,
      password: password,
    );

    final jwt = session.jwt;
    if (jwt == null || jwt.isEmpty) {
      throw const AppException('Resposta de login invalida.');
    }

    final expiresInMillis = session.expiresIn;
    final expiresAt = expiresInMillis != null
        ? DateTime.now().add(Duration(milliseconds: expiresInMillis))
        : null;
    await _tokenStorage.saveTokens(accessToken: jwt, expiresAt: expiresAt);
    await _tokenStorage.saveUserJson(jsonEncode(session.user.toJson()));
    _currentUser = session.user.toAppUser();
    return _currentUser!;
  }

  @override
  Future<void> signUpAthlete({
    required String name,
    required String username,
    required String email,
    required String password,
  }) {
    return _remoteDataSource.signUpAthlete(
      name: name,
      username: username,
      email: email,
      password: password,
    );
  }

  @override
  Future<void> signUpCompany({
    required String name,
    required String username,
    required String email,
    required String cnpj,
  }) {
    return _remoteDataSource.signUpCompany(
      name: name,
      username: username,
      email: email,
      cnpj: cnpj,
    );
  }

  @override
  Future<void> logout() async {
    _currentUser = null;
    await _tokenStorage.clear();
  }
}
