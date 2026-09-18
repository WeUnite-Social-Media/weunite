import 'package:json_annotation/json_annotation.dart';

import 'json_converters.dart';
import 'skill_dto.dart';

part 'user_dto.g.dart';

/// Subset of `UserDTO` (openapi: components.schemas.UserDTO), shared by
/// auth, profile, and chat (peer lookups) responses. Only the fields the
/// mobile app consumes are declared; unknown keys are ignored.
@JsonSerializable(createToJson: true)
class UserDto {
  const UserDto({
    required this.id,
    required this.name,
    required this.username,
    required this.role,
    required this.email,
    this.bio,
    this.profileImg,
    this.bannerImg,
    this.isPrivate = false,
    this.height,
    this.weight,
    this.footDomain,
    this.position,
    this.birthDate,
    this.skills,
  });

  factory UserDto.fromJson(Map<String, dynamic> json) =>
      _$UserDtoFromJson(json);

  @StringIdConverter()
  final int id;
  final String name;
  final String username;
  final String role;
  final String email;
  final String? bio;
  final String? profileImg;
  final String? bannerImg;
  final bool isPrivate;

  /// Athlete attributes; absent for companies.
  final double? height;
  final double? weight;
  final String? footDomain;
  final String? position;
  final DateTime? birthDate;
  final List<SkillDto>? skills;

  Map<String, dynamic> toJson() => _$UserDtoToJson(this);
}
