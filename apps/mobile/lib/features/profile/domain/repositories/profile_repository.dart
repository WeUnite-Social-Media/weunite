import '../entities/profile.dart';

abstract class ProfileRepository {
  Future<Profile> getProfileByUsername(String username);
  Future<Profile> getProfile(int userId);
  Future<Profile> getMyProfile();
  Future<void> toggleFollow({required int followedId});
}
