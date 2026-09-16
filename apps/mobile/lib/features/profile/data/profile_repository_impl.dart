import '../domain/entities/profile.dart';
import '../domain/repositories/profile_repository.dart';
import 'profile_remote_data_source.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  const ProfileRepositoryImpl({
    required ProfileRemoteDataSource remoteDataSource,
  }) : _remoteDataSource = remoteDataSource;

  final ProfileRemoteDataSource _remoteDataSource;

  @override
  Future<Profile> getProfileByUsername(String username) async {
    return (await _remoteDataSource.getProfileByUsername(username)).toEntity();
  }

  @override
  Future<Profile> getProfileById(int userId) async {
    return (await _remoteDataSource.getProfileById(userId)).toEntity();
  }

  @override
  Future<void> toggleFollow({
    required int followerId,
    required int followedId,
  }) {
    return _remoteDataSource.toggleFollow(
      followerId: followerId,
      followedId: followedId,
    );
  }
}
