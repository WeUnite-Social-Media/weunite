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
          if (post.content?.isNotEmpty ?? false) Text(post.content!),
          if (post.mediaUrl != null) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 420),
                child: Image.network(
                  post.mediaUrl!,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  loadingBuilder: (context, child, progress) {
                    if (progress == null) {
                      return child;
                    }
                    return const SizedBox(
                      height: 220,
                      child: Center(child: CircularProgressIndicator()),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) => SizedBox(
                    height: 120,
                    child: Center(
                      child: Icon(
                        Icons.broken_image_outlined,
                        color: Theme.of(context).disabledColor,
                      ),
                    ),
                  ),
                ),
              ),
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
