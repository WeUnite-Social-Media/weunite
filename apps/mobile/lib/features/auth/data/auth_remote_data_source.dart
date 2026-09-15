import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import 'auth_models.dart';

class AuthRemoteDataSource {
  const AuthRemoteDataSource(this._dio);

  final Dio _dio;

  Future<AuthSessionDto> login({
    required String username,
    required String password,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: {'username': username, 'password': password},
      );
      return AuthSessionDto.fromJson(response.data ?? {});
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
        data: {
          'name': name,
          'username': username,
          'email': email,
          'password': password,
          'role': 'athlete',
        },
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
        data: {
          'name': name,
          'username': username,
          'email': email,
          'cnpj': cnpj,
          'role': 'company',
        },
      );
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<AuthSessionDto> verifyEmail({
    required String email,
    required String verificationToken,
  }) async {
    try {
      final encodedEmail = Uri.encodeComponent(email);
      final response = await _dio.post<Map<String, dynamic>>(
        '/auth/verify-email/$encodedEmail',
        data: {'verificationToken': verificationToken},
      );
      return AuthSessionDto.fromJson(response.data ?? {});
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }
}
