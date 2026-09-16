import '../domain/entities/profile.dart';

class ProfileDto {
  const ProfileDto({
    required this.id,
    required this.name,
    required this.username,
    required this.role,
    this.email,
    this.bio,
    this.profileImg,
    this.bannerImg,
    this.followersCount = 0,
    this.followingCount = 0,
  });

  factory ProfileDto.fromJson(Map<String, dynamic> json) {
    final data = json['data'] is Map<String, dynamic>
        ? json['data'] as Map<String, dynamic>
        : json;

    return ProfileDto(
      id: int.tryParse(data['id']?.toString() ?? '') ?? 0,
      name: data['name']?.toString() ?? data['username']?.toString() ?? '',
      username: data['username']?.toString() ?? '',
      role: data['role']?.toString() ?? '',
      email: data['email']?.toString(),
      bio: data['bio']?.toString(),
      profileImg: data['profileImg']?.toString(),
      bannerImg: data['bannerImg']?.toString(),
      followersCount:
          int.tryParse(data['followersCount']?.toString() ?? '') ?? 0,
      followingCount:
          int.tryParse(data['followingCount']?.toString() ?? '') ?? 0,
    );
  }

  final int id;
  final String name;
  final String username;
  final String role;
  final String? email;
  final String? bio;
  final String? profileImg;
  final String? bannerImg;
  final int followersCount;
  final int followingCount;

  Profile toEntity() {
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
