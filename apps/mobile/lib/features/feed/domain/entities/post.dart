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
    this.likedByViewer = false,
  });

  final int id;
  final String? content;
  final String authorName;
  final String authorUsername;
  final String? authorAvatar;
  final String? mediaUrl;
  final DateTime createdAt;
  final int likesCount;
  final int commentsCount;
  final bool likedByViewer;

  Post copyWith({
    int? likesCount,
    int? commentsCount,
    bool? likedByViewer,
  }) {
    return Post(
      id: id,
      content: content,
      authorName: authorName,
      authorUsername: authorUsername,
      createdAt: createdAt,
      authorAvatar: authorAvatar,
      mediaUrl: mediaUrl,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      likedByViewer: likedByViewer ?? this.likedByViewer,
    );
  }

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
        likedByViewer,
      ];
}
