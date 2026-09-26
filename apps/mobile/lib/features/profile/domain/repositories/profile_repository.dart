import '../entities/profile.dart';

abstract class ProfileRepository {
  Future<Profile> getProfileByUsername(String username);
  Future<Profile> getProfile(int userId);
  Future<Profile> getMyProfile();

  /// Users matching [query] by name or username. Follower counters are not
  /// fetched here (one request per user would be too costly for a search).
  Future<List<Profile>> searchUsers(String query);

  /// Follows or unfollows [followedId] and returns the resulting state.
  Future<bool> toggleFollow({required int followedId});

  /// Updates the signed-in user's profile. A null field keeps the current
  /// value; an empty [bio] clears it. Image paths are local files.
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
  });

  /// Removes the signed-in user's banner image.
  Future<Profile> deleteMyBanner();

  /// Skill catalog offered in the profile form.
  Future<List<String>> getAvailableSkills();
}
