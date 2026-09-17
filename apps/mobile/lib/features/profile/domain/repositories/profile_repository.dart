import '../entities/profile.dart';

abstract class ProfileRepository {
  Future<Profile> getProfileByUsername(String username);
  Future<Profile> getProfile(int userId);
  Future<Profile> getMyProfile();

  /// Users matching [query] by name or username. Follower counters are not
  /// fetched here (one request per user would be too costly for a search).
  Future<List<Profile>> searchUsers(String query);
  Future<void> toggleFollow({required int followedId});
}
