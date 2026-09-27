import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/session/session_events.dart';
import 'package:weunite_mobile/features/auth/domain/entities/app_user.dart';
import 'package:weunite_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:weunite_mobile/features/auth/presentation/cubit/auth_cubit.dart';

class _FakeAuthRepository implements AuthRepository {
  @override
  Future<AppUser> verifyEmail({
    required String email,
    required String verificationToken,
  }) async =>
      throw UnimplementedError();

  @override
  AppUser? currentUser;

  @override
  Future<AppUser?> restoreSession() async => null;

  @override
  Future<AppUser> login({
    required String username,
    required String password,
  }) async {
    throw UnimplementedError();
  }

  @override
  Future<String?> signUpAthlete({
    required String name,
    required String username,
    required String email,
    required String password,
  }) async =>
      null;

  @override
  Future<String?> signUpCompany({
    required String name,
    required String username,
    required String email,
    required String cnpj,
    required String password,
  }) async =>
      null;

  @override
  Future<String?> sendResetPassword({required String email}) async => null;

  @override
  Future<String?> verifyResetToken({
    required String email,
    required String verificationToken,
  }) async =>
      null;

  @override
  Future<String?> resetPassword({
    required String verificationToken,
    required String newPassword,
  }) async =>
      null;

  @override
  Future<void> logout() async {}
}

void main() {
  group('AuthCubit session expiration', () {
    late SessionEvents sessionEvents;
    late _FakeAuthRepository repository;

    setUp(() {
      sessionEvents = SessionEvents();
      repository = _FakeAuthRepository();
    });

    tearDown(() => sessionEvents.dispose());

    blocTest<AuthCubit, AuthState>(
      'emits unauthenticated with session-expired message when '
      'SessionEvents.onExpired fires',
      build: () => AuthCubit(repository, sessionEvents),
      act: (cubit) async {
        sessionEvents.notifyExpired();
        await Future<void>.delayed(Duration.zero);
      },
      expect: () => [
        const AuthState(
          status: AuthStatus.unauthenticated,
          errorMessage: 'Sua sessão expirou. Entre novamente.',
        ),
      ],
    );
  });
}
