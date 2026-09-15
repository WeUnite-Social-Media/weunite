import 'package:equatable/equatable.dart';

class Comment extends Equatable {
  const Comment({
    required this.id,
    required this.content,
    required this.authorName,
    required this.authorUsername,
    required this.createdAt,
    this.authorAvatar,
  });

  final int id;
  final String content;
  final String authorName;
  final String authorUsername;
  final String? authorAvatar;
  final DateTime createdAt;

  @override
  List<Object?> get props => [
        id,
        content,
        authorName,
        authorUsername,
        authorAvatar,
        createdAt,
      ];
}
