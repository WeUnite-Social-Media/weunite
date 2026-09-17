import '../../../core/contracts/user_dto.dart';
import '../domain/entities/profile.dart';

extension UserDtoToProfile on UserDto {
  Profile toProfile({
    required int followersCount,
    required int followingCount,
  }) {
    return Profile(
      id: id,
      name: name,
      username: username,
      role: role,
      email: email,
      bio: bio,
      profileImg: profileImg,
      bannerImg: bannerImg,
      followersCount: followersCount,
      followingCount: followingCount,
    );
  }
}
