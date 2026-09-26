part of 'auth_cubit.dart';

enum AuthStatus { checking, unauthenticated, authenticated, loading }

class AuthState extends Equatable {
  const AuthState({
    this.status = AuthStatus.checking,
    this.user,
    this.errorMessage,
    this.successMessage,
  });

  final AuthStatus status;
  final AppUser? user;
  final String? errorMessage;
  final String? successMessage;

  bool get isLoading => status == AuthStatus.loading;

  AuthState copyWith({
    AuthStatus? status,
    AppUser? user,
    String? errorMessage,
    String? successMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage,
      successMessage: successMessage,
    );
  }

  @override
  List<Object?> get props => [status, user, errorMessage, successMessage];
}
