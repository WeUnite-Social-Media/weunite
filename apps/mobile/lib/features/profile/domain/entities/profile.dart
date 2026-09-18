import 'package:equatable/equatable.dart';

class Profile extends Equatable {
  const Profile({
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
    this.isPrivate = false,
    this.height,
    this.weight,
    this.footDomain,
    this.position,
    this.birthDate,
    this.skills = const [],
    this.isFollowing = false,
  });

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
  final bool isPrivate;

  /// Athlete attributes (empty for companies).
  final double? height;
  final double? weight;
  final String? footDomain;
  final String? position;
  final DateTime? birthDate;
  final List<String> skills;

  /// Whether the signed-in user follows this profile (always false on my own).
  final bool isFollowing;

  /// Age in whole years, the way the web "Sobre" section shows it.
  int? get age {
    final birth = birthDate;
    if (birth == null) {
      return null;
    }
    final now = DateTime.now();
    var years = now.year - birth.year;
    final hadBirthday = now.month > birth.month ||
        (now.month == birth.month && now.day >= birth.day);
    if (!hadBirthday) {
      years--;
    }
    return years < 0 ? null : years;
  }

  bool get isAthlete => !isCompany;

  Profile copyWith({
    int? followersCount,
    bool? isFollowing,
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
      followersCount: followersCount ?? this.followersCount,
      followingCount: followingCount,
      isPrivate: isPrivate,
      height: height,
      weight: weight,
      footDomain: footDomain,
      position: position,
      birthDate: birthDate,
      skills: skills,
      isFollowing: isFollowing ?? this.isFollowing,
    );
  }

  bool get isCompany => role.toUpperCase().contains('COMPANY');

  @override
  List<Object?> get props => [
        id,
        name,
        username,
        role,
        email,
        bio,
        profileImg,
        bannerImg,
        followersCount,
        followingCount,
        isPrivate,
        height,
        weight,
        footDomain,
        position,
        birthDate,
        skills,
        isFollowing,
      ];
}
