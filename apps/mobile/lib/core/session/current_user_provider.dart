import '../../features/auth/domain/repositories/auth_repository.dart';
import '../error/app_exception.dart';

abstract class CurrentUserProvider {
  int? get currentUserId;

  int requireUserId();
}

class AuthCurrentUserProvider implements CurrentUserProvider {
  const AuthCurrentUserProvider(this._authRepository);

  final AuthRepository _authRepository;

  @override
  int? get currentUserId => _authRepository.currentUser?.id;

  @override
  int requireUserId() {
    final id = currentUserId;
    if (id == null) {
      throw const AppException('Sessão inválida.');
    }
    return id;
  }
}
