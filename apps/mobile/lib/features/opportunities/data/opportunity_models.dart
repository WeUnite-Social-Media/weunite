import 'package:json_annotation/json_annotation.dart';

import '../../../core/contracts/skill_dto.dart';
import '../../../core/contracts/user_dto.dart';
import '../domain/entities/opportunity.dart';

part 'opportunity_models.g.dart';

/// Subset of `OpportunityDTO` (openapi:
/// components.schemas.OpportunityDTO), returned by `GET /opportunities/get`.
@JsonSerializable()
class OpportunityDto {
  const OpportunityDto({
    required this.id,
    required this.title,
    this.description,
    this.location,
    required this.dateEnd,
    this.skills,
    required this.company,
    required this.subscribersCount,
  });

  factory OpportunityDto.fromJson(Map<String, dynamic> json) =>
      _$OpportunityDtoFromJson(json);

  final int id;
  final String title;
  final String? description;
  final String? location;
  final DateTime dateEnd;

  /// `non_null` omits the (server-initialized, never empty) `skills`
  /// collection when it would be empty; treated as `const []` in
  /// [toEntity], not an invented value.
  final List<SkillDto>? skills;
  final UserDto company;
  final int subscribersCount;

  Opportunity toEntity() {
    return Opportunity(
      id: id,
      title: title,
      description: description,
      companyId: company.id,
      companyName: company.name,
      companyAvatar: company.profileImg,
      location: location,
      dateEnd: dateEnd,
      skills: skills?.map((skill) => skill.name).toList() ?? const [],
      subscribersCount: subscribersCount,
    );
  }
}
