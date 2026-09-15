import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/widgets/weunite_card.dart';
import '../../domain/entities/post.dart';

class PostCard extends StatelessWidget {
  const PostCard({
    required this.post,
    this.onLike,
    this.onComments,
    super.key,
  });

  final Post post;
  final VoidCallback? onLike;
  final VoidCallback? onComments;

  @override
  Widget build(BuildContext context) {
    return WeUniteCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: CircleAvatar(
              backgroundImage: post.authorAvatar == null
                  ? null
                  : NetworkImage(post.authorAvatar!),
              child: post.authorAvatar == null
                  ? Text(_initials(post.authorName))
                  : null,
            ),
            title: Text(post.authorName),
            subtitle: Text('@${post.authorUsername}'),
            trailing: Text(DateFormat('dd/MM').format(post.createdAt)),
          ),
          if (post.content.isNotEmpty) Text(post.content),
          if (post.mediaUrl != null) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.network(post.mediaUrl!, fit: BoxFit.cover),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              IconButton(
                onPressed: onLike,
                icon: Icon(
                  post.likedByViewer ? Icons.favorite : Icons.favorite_border,
                ),
                color: post.likedByViewer
                    ? Theme.of(context).colorScheme.error
                    : null,
              ),
              Text('${post.likesCount}'),
              const SizedBox(width: 16),
              IconButton(
                onPressed: onComments,
                icon: const Icon(Icons.mode_comment_outlined),
              ),
              Text('${post.commentsCount}'),
            ],
          ),
        ],
      ),
    );
  }

  String _initials(String value) {
    final words = value.trim().split(RegExp(r'\s+'));
    return words.take(2).map((word) => word[0].toUpperCase()).join();
  }
}
