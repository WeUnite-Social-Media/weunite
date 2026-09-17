import 'package:json_annotation/json_annotation.dart';

import 'json_converters.dart';

part 'user_summary_dto.g.dart';

/// Subset of `UserSummaryDTO` (openapi:
/// components.schemas.UserSummaryDTO), the lightweight author shape used
/// inside `FeedPostSummaryDTO`.
@JsonSerializable()
class UserSummaryDto {
  const UserSummaryDto({
    required this.id,
    required this.name,
    required this.username,
    this.profileImg,
  });

  factory UserSummaryDto.fromJson(Map<String, dynamic> json) =>
      _$UserSummaryDtoFromJson(json);

  @StringIdConverter()
  final int id;
  final String name;
  final String username;
  final String? profileImg;
}
