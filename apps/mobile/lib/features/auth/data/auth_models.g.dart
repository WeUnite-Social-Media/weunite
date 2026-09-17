// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Map<String, dynamic> _$LoginRequestDtoToJson(LoginRequestDto instance) =>
    <String, dynamic>{
      'username': instance.username,
      'password': instance.password,
    };

Map<String, dynamic> _$CreateUserRequestDtoToJson(
        CreateUserRequestDto instance) =>
    <String, dynamic>{
      'name': instance.name,
      'username': instance.username,
      'email': instance.email,
      'role': instance.role,
      'password': instance.password,
      'cnpj': instance.cnpj,
    };

AuthDto _$AuthDtoFromJson(Map<String, dynamic> json) => AuthDto(
      user: UserDto.fromJson(json['user'] as Map<String, dynamic>),
      jwt: json['jwt'] as String?,
      expiresIn: (json['expiresIn'] as num?)?.toInt(),
    );
