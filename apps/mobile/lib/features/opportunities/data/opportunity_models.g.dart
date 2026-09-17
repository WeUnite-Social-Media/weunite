// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'opportunity_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OpportunityDto _$OpportunityDtoFromJson(Map<String, dynamic> json) =>
    OpportunityDto(
      id: (json['id'] as num).toInt(),
      title: json['title'] as String,
      description: json['description'] as String?,
      location: json['location'] as String?,
      dateEnd: DateTime.parse(json['dateEnd'] as String),
      skills: (json['skills'] as List<dynamic>?)
          ?.map((e) => SkillDto.fromJson(e as Map<String, dynamic>))
          .toList(),
      company: UserDto.fromJson(json['company'] as Map<String, dynamic>),
      subscribersCount: (json['subscribersCount'] as num).toInt(),
    );
