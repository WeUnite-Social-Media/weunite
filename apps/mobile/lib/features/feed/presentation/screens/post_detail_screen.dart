import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/post.dart';
import '../../domain/repositories/feed_repository.dart';
import '../widgets/comments_sheet.dart';
import '../widgets/post_card.dart';

class PostDetailScreen extends StatefulWidget {
  const PostDetailScreen({required this.postId, super.key});

  final int postId;

  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  late Future<Post> _post;

  @override
  void initState() {
    super.initState();
    _post = context.read<FeedRepository>().getPost(postId: widget.postId);
  }

  Future<void> _reload() async {
    setState(() {
      _post = context.read<FeedRepository>().getPost(postId: widget.postId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Publicação')),
      body: FutureBuilder<Post>(
        future: _post,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Não foi possível carregar esta publicação.'),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: _reload,
                      child: const Text('Tentar novamente'),
                    ),
                  ],
                ),
              ),
            );
          }
          final post = snapshot.data!;
          return RefreshIndicator(
            onRefresh: _reload,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              children: [
                PostCard(
                  post: post,
                  onLike: () async {
                    await context
                        .read<FeedRepository>()
                        .toggleLike(postId: post.id);
                    await _reload();
                  },
                  onComments: () =>
                      showCommentsSheet(context, postId: post.id),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
