import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/widgets/weunite_card.dart';
import '../../domain/entities/post.dart';

class PostCard extends StatelessWidget {
  const PostCard({required this.post, super.key});

  final Post post;

  @override
  Widget build(BuildContext context) {
    return WeUniteCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: CircleAvatar(
              backgroundImage:
                  post.authorAvatar == null ? null : NetworkImage(post.authorAvatar!),
              child: post.authorAvatar == null ? Text(_initials(post.authorName)) : null,
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
                onPressed: () {},
                icon: const Icon(Icons.favorite_border),
              ),
              Text('${post.likesCount}'),
              const SizedBox(width: 16),
              IconButton(
                onPressed: () => _openComments(context),
                icon: const Icon(Icons.mode_comment_outlined),
              ),
              Text('${post.commentsCount}'),
            ],
          ),
        ],
      ),
    );
  }

  void _openComments(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      builder: (_) => const SizedBox(
        height: 320,
        child: Center(child: Text('Comentarios')),
      ),
    );
  }

  String _initials(String value) {
    final words = value.trim().split(RegExp(r'\s+'));
    return words.take(2).map((word) => word[0].toUpperCase()).join();
  }
}
