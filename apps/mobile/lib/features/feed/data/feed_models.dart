import '../domain/entities/post.dart';

class PostDto {
  const PostDto({
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

  factory PostDto.fromJson(Map<String, dynamic> json) {
    final user = (json['user'] as Map?)?.cast<String, dynamic>() ??
        (json['author'] as Map?)?.cast<String, dynamic>() ??
        {};

    return PostDto(
      id: int.tryParse(json['id']?.toString() ?? '') ?? 0,
      content: json['content']?.toString() ??
          json['description']?.toString() ??
          json['text']?.toString() ??
          '',
      authorName:
          user['name']?.toString() ?? user['username']?.toString() ?? 'Usuario',
      authorUsername: user['username']?.toString() ?? '',
      authorAvatar: user['profileImg']?.toString(),
      mediaUrl: json['imageUrl']?.toString() ??
          json['mediaUrl']?.toString() ??
          json['fileUrl']?.toString(),
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
      likesCount: int.tryParse(
            (json['likesCount'] ?? json['likes']?.length ?? 0).toString(),
          ) ??
          0,
      commentsCount: int.tryParse(
            (json['commentsCount'] ?? json['comments']?.length ?? 0).toString(),
          ) ??
          0,
      likedByViewer: json['likedByViewer'] == true,
    );
  }

  final int id;
  final String content;
  final String authorName;
  final String authorUsername;
  final String? authorAvatar;
  final String? mediaUrl;
  final DateTime createdAt;
  final int likesCount;
  final int commentsCount;
  final bool likedByViewer;

  Post toEntity() {
    return Post(
      id: id,
      content: content,
      authorName: authorName,
      authorUsername: authorUsername,
      authorAvatar: authorAvatar,
      mediaUrl: mediaUrl,
      createdAt: createdAt,
      likesCount: likesCount,
      commentsCount: commentsCount,
      likedByViewer: likedByViewer,
    );
  }
}
