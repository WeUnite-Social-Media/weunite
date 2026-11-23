// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'feed_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FeedPostSummaryDto _$FeedPostSummaryDtoFromJson(Map<String, dynamic> json) =>
    FeedPostSummaryDto(
      id: const StringIdConverter().fromJson(json['id'] as String),
      text: json['text'] as String?,
      imageUrl: json['imageUrl'] as String?,
      likesCount: (json['likesCount'] as num).toInt(),
      commentsCount: (json['commentsCount'] as num).toInt(),
      likedByViewer: json['likedByViewer'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      user: UserSummaryDto.fromJson(json['user'] as Map<String, dynamic>),
    );

PostDetailDto _$PostDetailDtoFromJson(Map<String, dynamic> json) =>
    PostDetailDto(
      id: const StringIdConverter().fromJson(json['id'] as String),
      text: json['text'] as String?,
      imageUrl: json['imageUrl'] as String?,
      likes: (json['likes'] as List<dynamic>)
          .map((item) =>
              PostLikeDto.fromJson(item as Map<String, dynamic>))
          .toList(),
      comments: (json['comments'] as List<dynamic>)
          .map((item) => CommentDto.fromJson(item as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      user: UserDto.fromJson(json['user'] as Map<String, dynamic>),
    );

PostLikeDto _$PostLikeDtoFromJson(Map<String, dynamic> json) => PostLikeDto(
      id: const StringIdConverter().fromJson(json['id'] as String),
      user: UserDto.fromJson(json['user'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$PostRequestDtoToJson(PostRequestDto instance) =>
    <String, dynamic>{
      'text': instance.text,
    };
