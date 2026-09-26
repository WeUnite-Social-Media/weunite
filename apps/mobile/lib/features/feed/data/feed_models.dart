import 'package:json_annotation/json_annotation.dart';

import '../../../core/contracts/json_converters.dart';
import '../../../core/contracts/user_summary_dto.dart';
import '../domain/entities/post.dart';

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

/// Request body for `POST /posts/create/{userId}` (openapi:
/// components.schemas.PostRequestDTO).
@JsonSerializable(createFactory: false, createToJson: true)
class PostRequestDto {
  const PostRequestDto({required this.text});

  final String text;

  Map<String, dynamic> toJson() => _$PostRequestDtoToJson(this);
}
