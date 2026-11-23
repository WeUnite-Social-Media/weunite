import 'package:json_annotation/json_annotation.dart';

import '../../../core/contracts/json_converters.dart';
import '../../../core/contracts/user_summary_dto.dart';
import '../../../core/contracts/user_dto.dart';
import '../domain/entities/post.dart';
import 'comment_models.dart';

part 'feed_models.g.dart';

/// Subset of `FeedPostSummaryDTO` (openapi:
/// components.schemas.FeedPostSummaryDTO), returned by `GET /posts/get`.
@JsonSerializable()
class FeedPostSummaryDto {
  const FeedPostSummaryDto({
    required this.id,
    this.text,
    this.imageUrl,
    required this.likesCount,
    required this.commentsCount,
    required this.likedByViewer,
    required this.createdAt,
    required this.user,
  });

  factory FeedPostSummaryDto.fromJson(Map<String, dynamic> json) =>
      _$FeedPostSummaryDtoFromJson(json);

  @StringIdConverter()
  final int id;
  final String? text;
  final String? imageUrl;
  final int likesCount;
  final int commentsCount;
  final bool likedByViewer;
  final DateTime createdAt;
  final UserSummaryDto user;

  Post toEntity() {
    return Post(
      id: id,
      content: text,
      authorId: user.id,
      authorName: user.name,
      authorUsername: user.username,
      authorAvatar: user.profileImg,
      mediaUrl: imageUrl,
      createdAt: createdAt,
      likesCount: likesCount,
      commentsCount: commentsCount,
      likedByViewer: likedByViewer,
    );
  }
}

@JsonSerializable()
class PostDetailDto {
  const PostDetailDto({
    required this.id,
    this.text,
    this.imageUrl,
    required this.likes,
    required this.comments,
    required this.createdAt,
    required this.user,
  });

  factory PostDetailDto.fromJson(Map<String, dynamic> json) =>
      _$PostDetailDtoFromJson(json);

  @StringIdConverter()
  final int id;
  final String? text;
  final String? imageUrl;
  final List<PostLikeDto> likes;
  final List<CommentDto> comments;
  final DateTime createdAt;
  final UserDto user;

  Post toEntity({required int viewerId}) {
    return Post(
      id: id,
      content: text,
      authorId: user.id,
      authorName: user.name,
      authorUsername: user.username,
      authorAvatar: user.profileImg,
      mediaUrl: imageUrl,
      createdAt: createdAt,
      likesCount: likes.length,
      commentsCount: comments.length,
      likedByViewer: likes.any((like) => like.user.id == viewerId),
    );
  }
}

@JsonSerializable()
class PostLikeDto {
  const PostLikeDto({required this.id, required this.user});

  factory PostLikeDto.fromJson(Map<String, dynamic> json) =>
      _$PostLikeDtoFromJson(json);

  @StringIdConverter()
  final int id;
  final UserDto user;
}

/// Request body for `POST /posts/create/{userId}` (openapi:
/// components.schemas.PostRequestDTO).
@JsonSerializable(createFactory: false, createToJson: true)
class PostRequestDto {
  const PostRequestDto({required this.text});

  final String text;

  Map<String, dynamic> toJson() => _$PostRequestDtoToJson(this);
}
