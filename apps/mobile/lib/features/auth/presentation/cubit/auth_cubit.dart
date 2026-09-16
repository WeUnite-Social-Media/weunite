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

  Future<void> login({
    required String username,
    required String password,
  }) async {
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
  }) async {
    emit(state.copyWith(status: AuthStatus.loading, errorMessage: null));
    try {
      await _repository.signUpAthlete(
        name: name,
        username: username,
        email: email,
        password: password,
      );
      emit(
        state.copyWith(
          status: AuthStatus.unauthenticated,
          successMessage: 'Cadastro criado. Verifique seu e-mail.',
        ),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          status: AuthStatus.unauthenticated,
          errorMessage: error.message,
        ),
      );
    }
  }

  Future<void> signUpCompany({
    required String name,
    required String username,
    required String email,
    required String cnpj,
  }) async {
    emit(state.copyWith(status: AuthStatus.loading, errorMessage: null));
    try {
      await _repository.signUpCompany(
        name: name,
        username: username,
        email: email,
        cnpj: cnpj,
      );
      emit(
        state.copyWith(
          status: AuthStatus.unauthenticated,
          successMessage: 'Empresa cadastrada. Verifique seu e-mail.',
        ),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          status: AuthStatus.unauthenticated,
          errorMessage: error.message,
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
