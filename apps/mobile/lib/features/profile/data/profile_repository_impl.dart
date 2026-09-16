import '../../../core/session/current_user_provider.dart';
import '../domain/entities/profile.dart';
import '../domain/repositories/profile_repository.dart';
import 'profile_remote_data_source.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  const ProfileRepositoryImpl({
    required ProfileRemoteDataSource remoteDataSource,
    required CurrentUserProvider currentUserProvider,
  })  : _remoteDataSource = remoteDataSource,
        _currentUserProvider = currentUserProvider;

  final ProfileRemoteDataSource _remoteDataSource;
  final CurrentUserProvider _currentUserProvider;

  @override
  Future<Profile> getProfileByUsername(String username) async {
    return (await _remoteDataSource.getProfileByUsername(username)).toEntity();
  }

  @override
  Future<Profile> getProfile(int userId) async {
    return (await _remoteDataSource.getProfileById(userId)).toEntity();
  }

  @override
  Future<Profile> getMyProfile() async {
    return getProfile(_currentUserProvider.requireUserId());
  }

  @override
  Future<void> toggleFollow({required int followedId}) {
    return _remoteDataSource.toggleFollow(
      followerId: _currentUserProvider.requireUserId(),
      followedId: followedId,
    );
  }
}
