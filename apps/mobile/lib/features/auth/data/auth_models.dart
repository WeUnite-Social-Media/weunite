import '../domain/entities/app_user.dart';

class AppUserDto {
  const AppUserDto({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    required this.role,
    this.profileImg,
    this.bannerImg,
    this.bio,
  });

  factory AppUserDto.fromJson(Map<String, dynamic> json) {
    return AppUserDto(
      id: int.tryParse(json['id']?.toString() ?? '') ?? 0,
      name: json['name']?.toString() ?? json['username']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? '',
      profileImg: json['profileImg']?.toString(),
      bannerImg: json['bannerImg']?.toString(),
      bio: json['bio']?.toString(),
    );
  }

  final int id;
  final String name;
  final String username;
  final String email;
  final String role;
  final String? profileImg;
  final String? bannerImg;
  final String? bio;

  AppUser toEntity() {
    return AppUser(
      id: id,
      name: name,
      username: username,
      email: email,
      role: role,
      profileImg: profileImg,
      bannerImg: bannerImg,
      bio: bio,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'username': username,
      'email': email,
      'role': role,
      'profileImg': profileImg,
      'bannerImg': bannerImg,
      'bio': bio,
    };
  }
}

class AuthSessionDto {
  const AuthSessionDto({
    required this.jwt,
    required this.user,
    this.expiresInMillis,
  });

  factory AuthSessionDto.fromJson(Map<String, dynamic> json) {
    final data = json['data'] is Map<String, dynamic>
        ? json['data'] as Map<String, dynamic>
        : json;

    return AuthSessionDto(
      jwt: data['jwt']?.toString() ?? data['token']?.toString() ?? '',
      user: AppUserDto.fromJson(
        (data['user'] as Map?)?.cast<String, dynamic>() ?? {},
      ),
      expiresInMillis: int.tryParse(data['expiresIn']?.toString() ?? ''),
    );
  }

  final String jwt;
  final AppUserDto user;
  final int? expiresInMillis;
}
