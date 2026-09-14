import '../entities/profile.dart';

abstract class ProfileRepository {
  Future<Profile> getProfileByUsername(String username);
  Future<Profile> getProfileById(int userId);
  Future<void> toggleFollow({required int followerId, required int followedId});
}
