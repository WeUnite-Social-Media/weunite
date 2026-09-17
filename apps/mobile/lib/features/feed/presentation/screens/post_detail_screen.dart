import 'package:flutter/material.dart';

/// Placeholder for the `/posts/:postId` route.
///
/// `GET /posts/get/{postId}` exists on the API (`PostController`) but
/// returns a `ResponseDTO<PostDTO>`, with `likes`/`comments` lists instead
/// of the counters `FeedPostSummaryDto` parses. Typing that shape and
/// wiring it is still pending (see `AGENTS.md`), so this route only
/// confirms navigation reaches the right post id for now.
class PostDetailScreen extends StatelessWidget {
  const PostDetailScreen({required this.postId, super.key});

  final int postId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Post #$postId')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Detalhe do post ainda não implementado.\n'
            'Endpoint disponível: GET /posts/get/$postId.',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
