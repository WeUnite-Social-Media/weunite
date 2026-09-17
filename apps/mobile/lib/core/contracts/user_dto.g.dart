// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserDto _$UserDtoFromJson(Map<String, dynamic> json) => UserDto(
      id: const StringIdConverter().fromJson(json['id'] as String),
      name: json['name'] as String,
      username: json['username'] as String,
      role: json['role'] as String,
      email: json['email'] as String,
      bio: json['bio'] as String?,
      profileImg: json['profileImg'] as String?,
      bannerImg: json['bannerImg'] as String?,
    );

Map<String, dynamic> _$UserDtoToJson(UserDto instance) => <String, dynamic>{
      'id': const StringIdConverter().toJson(instance.id),
      'name': instance.name,
      'username': instance.username,
      'role': instance.role,
      'email': instance.email,
      'bio': instance.bio,
      'profileImg': instance.profileImg,
      'bannerImg': instance.bannerImg,
    };
