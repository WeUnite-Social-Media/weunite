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

  /// Returns the envelope message ("Cadastro concluído! Verifique seu email"),
  /// which is what the web puts in its toast.
  Future<String?> signUpAthlete({
    required String name,
    required String username,
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post<Object?>(
        '/auth/signup',
        data: CreateUserRequestDto(
          name: name,
          username: username,
          email: email,
          password: password,
          role: 'athlete',
        ).toJson(),
      );
      return decodeResponseMessage(response.data);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `POST /auth/signup/company`.
  ///
  /// The password is required here: both sign-up routes hit the same
  /// `CreateUserRequestDTO`, whose `password` is `@NotBlank @ValidPassword`, so
  /// a club sign-up without one is rejected with 400 before a user is created.
  /// The web's `signUpCompanySchema` does send it (its TypeScript interface
  /// omitting the field is what made this easy to miss).
  Future<String?> signUpCompany({
    required String name,
    required String username,
    required String email,
    required String cnpj,
    required String password,
  }) async {
    try {
      final response = await _dio.post<Object?>(
        '/auth/signup/company',
        data: CreateUserRequestDto(
          name: name,
          username: username,
          email: email,
          role: 'company',
          cnpj: cnpj,
          password: password,
        ).toJson(),
      );
      return decodeResponseMessage(response.data);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `POST /auth/send-reset-password` — mails a six-digit code.
  Future<String?> sendResetPassword({required String email}) async {
    try {
      final response = await _dio.post<Object?>(
        '/auth/send-reset-password',
        data: {'email': email},
      );
      return decodeResponseMessage(response.data);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `POST /auth/verify-reset-token/{email}` — checks the code without
  /// consuming it; the code itself is then the path segment of the reset call.
  Future<String?> verifyResetToken({
    required String email,
    required String verificationToken,
  }) async {
    try {
      final response = await _dio.post<Object?>(
        '/auth/verify-reset-token/${Uri.encodeComponent(email)}',
        data: {'verificationToken': verificationToken},
      );
      return decodeResponseMessage(response.data);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `POST /auth/reset-password/{verificationToken}`. Sets the new password and
  /// clears the token; it does not return a session, so the user logs in again
  /// afterwards — same as the web, which sends you back to `/auth`.
  Future<String?> resetPassword({
    required String verificationToken,
    required String newPassword,
  }) async {
    try {
      final response = await _dio.post<Object?>(
        '/auth/reset-password/${Uri.encodeComponent(verificationToken)}',
        data: {'newPassword': newPassword},
      );
      return decodeResponseMessage(response.data);
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
