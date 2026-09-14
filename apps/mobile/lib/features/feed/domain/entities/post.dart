import 'package:equatable/equatable.dart';

class Post extends Equatable {
  const Post({
    required this.id,
    required this.content,
    required this.authorName,
    required this.authorUsername,
    required this.createdAt,
    this.authorAvatar,
    this.mediaUrl,
    this.likesCount = 0,
    this.commentsCount = 0,
  });

  final int id;
  final String content;
  final String authorName;
  final String authorUsername;
  final String? authorAvatar;
  final String? mediaUrl;
  final DateTime createdAt;
  final int likesCount;
  final int commentsCount;

  @override
  List<Object?> get props => [
        id,
        content,
        authorName,
        authorUsername,
        authorAvatar,
        mediaUrl,
        createdAt,
        likesCount,
        commentsCount,
      ];
}
