import 'package:json_annotation/json_annotation.dart';

part 'skill_dto.g.dart';

/// Subset of `SkillDTO` (openapi: components.schemas.SkillDTO).
@JsonSerializable()
class SkillDto {
  const SkillDto({required this.name});

  factory SkillDto.fromJson(Map<String, dynamic> json) =>
      _$SkillDtoFromJson(json);

  final String name;
}
