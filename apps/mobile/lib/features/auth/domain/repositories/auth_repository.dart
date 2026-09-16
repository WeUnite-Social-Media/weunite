import '../entities/app_user.dart';

abstract class AuthRepository {
  AppUser? get currentUser;

  Future<AppUser?> restoreSession();
  Future<AppUser> login({required String username, required String password});
  Future<void> signUpAthlete({
    required String name,
    required String username,
    required String email,
    required String password,
  });
  Future<void> signUpCompany({
    required String name,
    required String username,
    required String email,
    required String cnpj,
  });
  Future<void> logout();
}
