import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/session/session_events.dart';
import 'package:weunite_mobile/features/auth/domain/entities/app_user.dart';
import 'package:weunite_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:weunite_mobile/features/auth/presentation/cubit/auth_cubit.dart';

/// The three recovery steps through the cubit, plus the loading guard that all
/// of the message-only actions share.
void main() {
  late _FakeAuthRepository repository;
  late SessionEvents sessionEvents;
  late AuthCubit cubit;

  setUp(() {
    repository = _FakeAuthRepository();
    sessionEvents = SessionEvents();
    cubit = AuthCubit(repository, sessionEvents);
  });

  tearDown(() async {
    await cubit.close();
    sessionEvents.dispose();
  });

  test('sendResetPassword reports the API message', () async {
    repository.message = 'Código enviado!';

    await cubit.sendResetPassword(email: 'joao@provedor.com');

    expect(repository.sentTo, ['joao@provedor.com']);
    expect(cubit.state.successMessage, 'Código enviado!');
    expect(cubit.state.status, AuthStatus.unauthenticated);
    expect(cubit.state.errorMessage, isNull);
  });

  test('falls back to the web wording when the API sends no message', () async {
    repository.message = null;

    await cubit.sendResetPassword(email: 'joao@provedor.com');

    expect(cubit.state.successMessage, 'Codigo enviado!');
  });

  test('verifyResetToken surfaces an invalid code as an error', () async {
    repository.failure = const AppException('Token invalido');

    await cubit.verifyResetToken(
      email: 'joao@provedor.com',
      verificationToken: '000000',
    );

    expect(cubit.state.errorMessage, 'Token invalido');
    expect(cubit.state.successMessage, isNull);
  });

  test('resetPassword does not authenticate the user', () async {
    repository.message = 'Senha redefinida!';

    await cubit.resetPassword(
      verificationToken: '123456',
      newPassword: 'Abcdefg1!',
    );

    expect(cubit.state.successMessage, 'Senha redefinida!');
    expect(cubit.state.status, AuthStatus.unauthenticated);
    expect(cubit.state.user, isNull);
  });

  test('a second submit while the first is in flight is ignored', () async {
    repository.gate = Completer<void>();

    final first = cubit.sendResetPassword(email: 'joao@provedor.com');
    await cubit.sendResetPassword(email: 'joao@provedor.com');
    repository.gate!.complete();
    await first;

    expect(repository.sentTo, ['joao@provedor.com']);
  });

  test('an unexpected failure still produces a readable message', () async {
    repository.rawFailure = StateError('boom');

    await cubit.signUpAthlete(
      name: 'Joao da Silva',
      username: 'joaosilva',
      email: 'joao@provedor.com',
      password: 'Abcdefg1!',
    );

    expect(cubit.state.errorMessage, 'Nao foi possivel concluir o cadastro.');
  });

  test('clearMessages drops a message the UI already showed', () async {
    repository.message = 'Código enviado!';
    await cubit.sendResetPassword(email: 'joao@provedor.com');

    cubit.clearMessages();

    expect(cubit.state.successMessage, isNull);
    expect(cubit.state.status, AuthStatus.unauthenticated);
  });
}

class _FakeAuthRepository implements AuthRepository {
  String? message;
  AppException? failure;
  Object? rawFailure;
  Completer<void>? gate;
  final sentTo = <String>[];

  Future<String?> _answer() async {
    if (gate != null) {
      await gate!.future;
    }
    if (rawFailure != null) {
      throw rawFailure!;
    }
    if (failure != null) {
      throw failure!;
    }
    return message;
  }

  @override
  AppUser? currentUser;

  @override
  Future<AppUser?> restoreSession() async => null;

  @override
  Future<AppUser> login({
    required String username,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<String?> signUpAthlete({
    required String name,
    required String username,
    required String email,
    required String password,
  }) =>
      _answer();

  @override
  Future<String?> signUpCompany({
    required String name,
    required String username,
    required String email,
    required String cnpj,
    required String password,
  }) =>
      _answer();

  @override
  Future<AppUser> verifyEmail({
    required String email,
    required String verificationToken,
  }) async =>
      throw UnimplementedError();

  @override
  Future<String?> sendResetPassword({required String email}) {
    sentTo.add(email);
    return _answer();
  }

  @override
  Future<String?> verifyResetToken({
    required String email,
    required String verificationToken,
  }) =>
      _answer();

  @override
  Future<String?> resetPassword({
    required String verificationToken,
    required String newPassword,
  }) =>
      _answer();

  @override
  Future<void> logout() async {}
}
