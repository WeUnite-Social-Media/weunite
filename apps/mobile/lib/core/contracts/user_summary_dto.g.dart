// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_summary_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserSummaryDto _$UserSummaryDtoFromJson(Map<String, dynamic> json) =>
    UserSummaryDto(
      id: const StringIdConverter().fromJson(json['id'] as String),
      name: json['name'] as String,
      username: json['username'] as String,
      profileImg: json['profileImg'] as String?,
    );
