import 'package:json_annotation/json_annotation.dart';

import '../../../core/contracts/json_converters.dart';
import '../../../core/contracts/user_dto.dart';
import '../domain/entities/comment.dart';

part 'comment_models.g.dart';

/// Subset of `CommentDTO` (openapi: components.schemas.CommentDTO),
/// returned by `GET /comment/get/{postId}`.
@JsonSerializable()
class CommentDto {
  const CommentDto({
    required this.id,
    required this.user,
    this.text,
    required this.createdAt,
  });

  factory CommentDto.fromJson(Map<String, dynamic> json) =>
      _$CommentDtoFromJson(json);

  @StringIdConverter()
  final int id;
  final UserDto user;
  final String? text;
  final DateTime createdAt;

  Comment toEntity() {
    return Comment(
      id: id,
      content: text,
      authorId: user.id,
      authorName: user.name,
      authorUsername: user.username,
      authorAvatar: user.profileImg,
      createdAt: createdAt,
    );
  }
}

/// Request body for `POST /comment/create` (openapi:
/// components.schemas.CommentRequestDTO). `image` is accepted by the API
/// but not sent by the mobile app yet.
@JsonSerializable(createFactory: false, createToJson: true)
class CommentRequestDto {
  const CommentRequestDto({required this.text, this.image});

  final String text;
  final String? image;

  Map<String, dynamic> toJson() => _$CommentRequestDtoToJson(this);
}
