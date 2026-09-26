import '../entities/app_user.dart';

/// Authentication, mirroring the seven endpoints of the API's `AuthController`
/// — the same seven the web's `authService.ts` calls. There is no refresh
/// endpoint and no social login: `POST /auth/login` and
/// `POST /auth/verify-email/{email}` are the only calls that return a session.
///
/// The sign-up and recovery calls return the API's own message
/// ("Cadastro concluído! Verifique seu email", "Código enviado!", …) so the UI
/// can show the server's text, as the web does.
abstract class AuthRepository {
  AppUser? get currentUser;

  Future<AppUser?> restoreSession();
  Future<AppUser> login({required String username, required String password});
  Future<String?> signUpAthlete({
    required String name,
    required String username,
    required String email,
    required String password,
  });
  Future<String?> signUpCompany({
    required String name,
    required String username,
    required String email,
    required String cnpj,
    required String password,
  });
  Future<AppUser> verifyEmail({
    required String email,
    required String verificationToken,
  });
  Future<String?> sendResetPassword({required String email});
  Future<String?> verifyResetToken({
    required String email,
    required String verificationToken,
  });
  Future<String?> resetPassword({
    required String verificationToken,
    required String newPassword,
  });
  Future<void> logout();
}
