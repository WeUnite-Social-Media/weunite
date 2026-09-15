import '../domain/entities/comment.dart';

class CommentDto {
  const CommentDto({
    required this.id,
    required this.content,
    required this.authorName,
    required this.authorUsername,
    required this.createdAt,
    this.authorAvatar,
  });

  factory CommentDto.fromJson(Map<String, dynamic> json) {
    final user = (json['user'] as Map?)?.cast<String, dynamic>() ?? {};

    return CommentDto(
      id: int.tryParse(json['id']?.toString() ?? '') ?? 0,
      content: json['text']?.toString() ??
          json['content']?.toString() ??
          json['message']?.toString() ??
          '',
      authorName:
          user['name']?.toString() ?? user['username']?.toString() ?? 'Usuario',
      authorUsername: user['username']?.toString() ?? '',
      authorAvatar: user['profileImg']?.toString(),
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
    );
  }

  final int id;
  final String content;
  final String authorName;
  final String authorUsername;
  final String? authorAvatar;
  final DateTime createdAt;

  Comment toEntity() {
    return Comment(
      id: id,
      content: content,
      authorName: authorName,
      authorUsername: authorUsername,
      authorAvatar: authorAvatar,
      createdAt: createdAt,
    );
  }
}
