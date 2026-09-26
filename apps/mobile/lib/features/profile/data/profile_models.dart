import '../../../core/contracts/user_dto.dart';
import '../domain/entities/profile.dart';

extension UserDtoToProfile on UserDto {
  Profile toProfile({
    required int followersCount,
    required int followingCount,
    bool isFollowing = false,
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
      isPrivate: isPrivate,
      height: height,
      weight: weight,
      footDomain: footDomain,
      position: position,
      birthDate: birthDate,
      skills: skills?.map((skill) => skill.name).toList() ?? const [],
      isFollowing: isFollowing,
    );
  }
}
