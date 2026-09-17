// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'comment_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CommentDto _$CommentDtoFromJson(Map<String, dynamic> json) => CommentDto(
      id: const StringIdConverter().fromJson(json['id'] as String),
      user: UserDto.fromJson(json['user'] as Map<String, dynamic>),
      text: json['text'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$CommentRequestDtoToJson(CommentRequestDto instance) =>
    <String, dynamic>{
      'text': instance.text,
      'image': instance.image,
    };
