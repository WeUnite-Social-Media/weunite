import 'package:equatable/equatable.dart';

class Comment extends Equatable {
  const Comment({
    required this.id,
    required this.content,
    required this.authorName,
    required this.authorUsername,
    required this.createdAt,
    this.authorId,
    this.authorAvatar,
  });

  final int id;
  final String? content;
  final String authorName;
  final String authorUsername;

  /// Author's user id, used to open their profile. Null when unknown.
  final int? authorId;
  final String? authorAvatar;
  final DateTime createdAt;

  @override
  List<Object?> get props => [
        id,
        content,
        authorName,
        authorUsername,
        authorId,
        authorAvatar,
        createdAt,
      ];
}
