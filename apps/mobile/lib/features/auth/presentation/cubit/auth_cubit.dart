import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/session/session_events.dart';
import '../../domain/entities/app_user.dart';
import '../../domain/repositories/auth_repository.dart';

part 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  AuthCubit(this._repository, this._sessionEvents) : super(const AuthState()) {
    _sessionExpiredSubscription = _sessionEvents.onExpired.listen((_) {
      emit(
        const AuthState(
          status: AuthStatus.unauthenticated,
          errorMessage: 'Sua sessão expirou. Entre novamente.',
        ),
      );
    });
  }

  final AuthRepository _repository;
  final SessionEvents _sessionEvents;
  late final StreamSubscription<void> _sessionExpiredSubscription;

  Future<void> restoreSession() async {
    emit(state.copyWith(status: AuthStatus.checking));
    final user = await _repository.restoreSession();
    emit(
      user == null
          ? state.copyWith(status: AuthStatus.unauthenticated)
          : state.copyWith(status: AuthStatus.authenticated, user: user),
    );
  }

  /// Drops the message the UI has already shown, so it is not shown twice when
  /// the state changes again (the web's `clearMessages`).
  void clearMessages() {
    if (state.errorMessage == null && state.successMessage == null) {
      return;
    }
    emit(state.copyWith());
  }

  Future<void> login({
    required String username,
    required String password,
  }) async {
    if (state.isLoading) {
      return;
    }
    emit(state.copyWith(status: AuthStatus.loading, errorMessage: null));
    try {
      final user = await _repository.login(
        username: username,
        password: password,
      );
      emit(state.copyWith(status: AuthStatus.authenticated, user: user));
    } on AppException catch (error) {
      emit(
        state.copyWith(
          status: AuthStatus.unauthenticated,
          errorMessage: error.message,
        ),
      );
    } catch (_) {
      emit(
        state.copyWith(
          status: AuthStatus.unauthenticated,
          errorMessage: 'Nao foi possivel entrar.',
        ),
      );
    }
  }

  Future<void> signUpAthlete({
    required String name,
    required String username,
    required String email,
    required String password,
  }) {
    return _runUnauthenticatedAction(
      () => _repository.signUpAthlete(
        name: name,
        username: username,
        email: email,
        password: password,
      ),
      fallbackMessage: 'Cadastro concluido! Verifique seu email',
      failureMessage: 'Nao foi possivel concluir o cadastro.',
    );
  }

  Future<void> signUpCompany({
    required String name,
    required String username,
    required String email,
    required String cnpj,
    required String password,
  }) {
    return _runUnauthenticatedAction(
      () => _repository.signUpCompany(
        name: name,
        username: username,
        email: email,
        cnpj: cnpj,
        password: password,
      ),
      fallbackMessage: 'Cadastro concluido! Verifique seu email',
      failureMessage: 'Nao foi possivel cadastrar o clube.',
    );
  }

  /// Step 1 of the recovery flow: mails a six-digit code
  /// (`POST /auth/send-reset-password`).
  Future<void> sendResetPassword({required String email}) {
    return _runUnauthenticatedAction(
      () => _repository.sendResetPassword(email: email),
      fallbackMessage: 'Codigo enviado!',
      failureMessage: 'Nao foi possivel enviar o codigo.',
    );
  }

  /// Step 2: checks the code before asking for a new password.
  Future<void> verifyResetToken({
    required String email,
    required String verificationToken,
  }) {
    return _runUnauthenticatedAction(
      () => _repository.verifyResetToken(
        email: email,
        verificationToken: verificationToken,
      ),
      fallbackMessage: 'Codigo verificado!',
      failureMessage: 'Nao foi possivel verificar o codigo.',
    );
  }

  /// Step 3: stores the new password. No session comes back, so the user goes
  /// to the login screen afterwards — the same as the web.
  Future<void> resetPassword({
    required String verificationToken,
    required String newPassword,
  }) {
    return _runUnauthenticatedAction(
      () => _repository.resetPassword(
        verificationToken: verificationToken,
        newPassword: newPassword,
      ),
      fallbackMessage: 'Senha redefinida!',
      failureMessage: 'Nao foi possivel redefinir a senha.',
    );
  }

  /// Shared shape of every call that reports a message but does *not* create a
  /// session (both sign-ups and the three recovery steps): shows the loading
  /// state, blocks a second submit while it is in flight, and ends back on
  /// `unauthenticated` with either the API's own message or the error's.
  Future<void> _runUnauthenticatedAction(
    Future<String?> Function() action, {
    required String fallbackMessage,
    required String failureMessage,
  }) async {
    if (state.isLoading) {
      return;
    }
    emit(
      state.copyWith(
        status: AuthStatus.loading,
        errorMessage: null,
        successMessage: null,
      ),
    );
    try {
      final message = await action();
      emit(
        state.copyWith(
          status: AuthStatus.unauthenticated,
          successMessage: message ?? fallbackMessage,
        ),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          status: AuthStatus.unauthenticated,
          errorMessage: error.message,
          successMessage: null,
        ),
      );
    } catch (_) {
      emit(
        state.copyWith(
          status: AuthStatus.unauthenticated,
          errorMessage: failureMessage,
          successMessage: null,
        ),
      );
    }
  }

  Future<void> verifyEmail({
    required String email,
    required String verificationToken,
  }) async {
    if (state.isLoading) {
      return;
    }
    emit(
      state.copyWith(
        status: AuthStatus.loading,
        errorMessage: null,
        successMessage: null,
      ),
    );
    try {
      final user = await _repository.verifyEmail(
        email: email,
        verificationToken: verificationToken,
      );
      emit(
        state.copyWith(
          status: AuthStatus.authenticated,
          user: user,
          successMessage: 'Email verificado com sucesso.',
        ),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          status: AuthStatus.unauthenticated,
          errorMessage: error.message,
          successMessage: null,
        ),
      );
    } catch (_) {
      emit(
        state.copyWith(
          status: AuthStatus.unauthenticated,
          errorMessage: 'Nao foi possivel verificar seu email.',
          successMessage: null,
        ),
      );
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    emit(const AuthState(status: AuthStatus.unauthenticated));
  }

  @override
  Future<void> close() {
    _sessionExpiredSubscription.cancel();
    return super.close();
  }
}
