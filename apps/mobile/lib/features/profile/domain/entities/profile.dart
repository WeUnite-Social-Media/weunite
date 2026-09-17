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
      ];
}
