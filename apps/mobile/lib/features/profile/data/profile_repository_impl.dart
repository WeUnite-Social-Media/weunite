import '../../../core/contracts/user_dto.dart';
import '../../../core/session/current_user_provider.dart';
import '../domain/entities/profile.dart';
import '../domain/repositories/profile_repository.dart';
import 'profile_models.dart';
import 'profile_remote_data_source.dart';
import 'update_profile_models.dart';

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
    final user = await _remoteDataSource.getProfileByUsername(username);
    return _withFollowCounts(user);
  }

  @override
  Future<Profile> getProfile(int userId) async {
    final results = await Future.wait<Object>([
      _remoteDataSource.getProfileById(userId),
      _remoteDataSource.countFollowers(userId),
      _remoteDataSource.countFollowing(userId),
    ]);
    return (results[0] as UserDto).toProfile(
      followersCount: results[1] as int,
      followingCount: results[2] as int,
    );
  }

  @override
  Future<Profile> getMyProfile() async {
    return getProfile(_currentUserProvider.requireUserId());
  }

  @override
  Future<List<Profile>> searchUsers(String query) async {
    final users = await _remoteDataSource.searchUsers(query);
    return users
        .map((user) => user.toProfile(followersCount: 0, followingCount: 0))
        .toList();
  }

  @override
  Future<void> toggleFollow({required int followedId}) {
    return _remoteDataSource.toggleFollow(
      followerId: _currentUserProvider.requireUserId(),
      followedId: followedId,
    );
  }

  Future<Profile> _withFollowCounts(UserDto user) async {
    final counts = await Future.wait<int>([
      _remoteDataSource.countFollowers(user.id),
      _remoteDataSource.countFollowing(user.id),
    ]);
    return user.toProfile(followersCount: counts[0], followingCount: counts[1]);
  }

  @override
  Future<Profile> updateMyProfile({
    String? name,
    String? username,
    String? bio,
    bool? isPrivate,
    double? height,
    double? weight,
    String? footDomain,
    String? position,
    DateTime? birthDate,
    List<String>? skills,
    String? profileImagePath,
    String? bannerImagePath,
  }) async {
    final current = await getMyProfile();
    final updated = await _remoteDataSource.updateUser(
      username: current.username,
      request: UpdateUserRequestDto(
        name: name,
        username: username,
        bio: bio,
        isPrivate: isPrivate,
        height: height,
        weight: weight,
        footDomain: footDomain,
        position: position,
        birthDate: birthDate,
        skills: skills,
      ),
      profileImagePath: profileImagePath,
      bannerImagePath: bannerImagePath,
    );
    return updated.toProfile(
      followersCount: current.followersCount,
      followingCount: current.followingCount,
    );
  }

  @override
  Future<Profile> deleteMyBanner() async {
    final current = await getMyProfile();
    await _remoteDataSource.deleteBanner(current.username);
    return getMyProfile();
  }

  @override
  Future<List<String>> getAvailableSkills() async {
    final skills = await _remoteDataSource.getSkills();
    return skills.map((skill) => skill.name).toList();
  }
}
