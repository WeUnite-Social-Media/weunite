import 'package:intl/intl.dart';

/// Body of the `user` part of `PUT /user/update/{username}` (openapi:
/// components.schemas.UpdateUserRequestDTO).
///
/// The API keeps the current value for a `null` field, and `bio` is the one
/// field it clears when an empty string is sent.
class UpdateUserRequestDto {
  const UpdateUserRequestDto({
    this.name,
    this.username,
    this.bio,
    this.isPrivate,
    this.height,
    this.weight,
    this.footDomain,
    this.position,
    this.birthDate,
    this.skills,
  });

  final String? name;
  final String? username;
  final String? bio;
  final bool? isPrivate;
  final double? height;
  final double? weight;
  final String? footDomain;
  final String? position;
  final DateTime? birthDate;

  /// Skill names; the API resolves them to its own catalog entries.
  final List<String>? skills;

  Map<String, Object?> toJson() {
    return {
      if (name != null) 'name': name,
      if (username != null) 'username': username,
      if (bio != null) 'bio': bio,
      if (isPrivate != null) 'isPrivate': isPrivate,
      if (height != null) 'height': height,
      if (weight != null) 'weight': weight,
      if (footDomain != null) 'footDomain': footDomain,
      if (position != null) 'position': position,
      if (birthDate != null)
        'birthDate': DateFormat('yyyy-MM-dd').format(birthDate!),
      if (skills != null)
        'skills': [
          for (final skill in skills!) {'name': skill},
        ],
    };
  }
}
