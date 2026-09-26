import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/json_body.dart';
import 'auth_models.dart';

class AuthRemoteDataSource {
  const AuthRemoteDataSource(this._dio);

  final Dio _dio;

  Future<AuthDto> login({
    required String username,
    required String password,
  }) async {
    try {
      final response = await _dio.post<Object?>(
        '/auth/login',
        data: LoginRequestDto(username: username, password: password).toJson(),
      );
      return decodeResponseData<AuthDto>(
        response.data,
        (data) => AuthDto.fromJson(asJsonObject(data)),
      );
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<void> signUpAthlete({
    required String name,
    required String username,
    required String email,
    required String password,
  }) async {
    try {
      await _dio.post<void>(
        '/auth/signup',
        data: CreateUserRequestDto(
          name: name,
          username: username,
          email: email,
          password: password,
          role: 'athlete',
        ).toJson(),
      );
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<void> signUpCompany({
    required String name,
    required String username,
    required String email,
    required String cnpj,
  }) async {
    try {
      await _dio.post<void>(
        '/auth/signup/company',
        data: CreateUserRequestDto(
          name: name,
          username: username,
          email: email,
          role: 'company',
          cnpj: cnpj,
        ).toJson(),
      );
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// Verifies the e-mail and returns the session, like login does.
  ///
  /// This method came from the e-mail verification branch, which predated the
  /// typed-contract refactor: it used `AuthSessionDto` and read the body
  /// directly. It now uses `AuthDto` and the same envelope decoding as
  /// [login], so a malformed payload fails the same way everywhere.
  Future<AuthDto> verifyEmail({
    required String email,
    required String verificationToken,
  }) async {
    try {
      final encodedEmail = Uri.encodeComponent(email);
      final response = await _dio.post<Object?>(
        '/auth/verify-email/$encodedEmail',
        data: {'verificationToken': verificationToken},
      );
      return decodeResponseData<AuthDto>(
        response.data,
        (data) => AuthDto.fromJson(asJsonObject(data)),
      );
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }
}
