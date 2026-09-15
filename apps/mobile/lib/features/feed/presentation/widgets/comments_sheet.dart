import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../domain/entities/comment.dart';
import '../cubit/feed_cubit.dart';

class CommentsSheet extends StatefulWidget {
  const CommentsSheet({
    required this.postId,
    super.key,
  });

  final int postId;

  @override
  State<CommentsSheet> createState() => _CommentsSheetState();
}

class _CommentsSheetState extends State<CommentsSheet> {
  final _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    context.read<FeedCubit>().loadComments(postId: widget.postId);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final userId = context.read<AuthCubit>().state.user?.id;
    final content = _controller.text.trim();
    if (userId == null || content.isEmpty) {
      return;
    }

    await context.read<FeedCubit>().createComment(
          userId: userId,
          postId: widget.postId,
          content: content,
        );
    _controller.clear();
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.72,
      minChildSize: 0.44,
      maxChildSize: 0.92,
      builder: (context, scrollController) {
        return BlocBuilder<FeedCubit, FeedState>(
          builder: (context, state) {
            final comments = state.commentsByPost[widget.postId] ?? const [];

            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 12,
                bottom: MediaQuery.of(context).viewInsets.bottom + 16,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Theme.of(context).dividerColor,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Comentarios',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: comments.isEmpty
                        ? const Center(child: Text('Ainda sem comentarios.'))
                        : ListView.separated(
                            controller: scrollController,
                            itemCount: comments.length,
                            separatorBuilder: (_, __) =>
                                const Divider(height: 24),
                            itemBuilder: (context, index) {
                              return _CommentTile(comment: comments[index]);
                            },
                          ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _controller,
                          minLines: 1,
                          maxLines: 4,
                          decoration: const InputDecoration(
                            hintText: 'Escreva um comentario...',
                          ),
                          textInputAction: TextInputAction.send,
                          onSubmitted: (_) => _submit(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        onPressed: state.isSubmitting ? null : _submit,
                        icon: state.isSubmitting
                            ? const SizedBox.square(
                                dimension: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.send),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

class _CommentTile extends StatelessWidget {
  const _CommentTile({required this.comment});

  final Comment comment;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 18,
          backgroundImage: comment.authorAvatar == null
              ? null
              : NetworkImage(comment.authorAvatar!),
          child: comment.authorAvatar == null
              ? Text(_initials(comment.authorName))
              : null,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      comment.authorName,
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                  ),
                  Text(
                    DateFormat('dd/MM HH:mm').format(comment.createdAt),
                    style: Theme.of(context).textTheme.labelSmall,
                  ),
                ],
              ),
              if (comment.authorUsername.isNotEmpty)
                Text(
                  '@${comment.authorUsername}',
                  style: Theme.of(context).textTheme.labelMedium,
                ),
              const SizedBox(height: 4),
              Text(comment.content),
            ],
          ),
        ),
      ],
    );
  }

  String _initials(String value) {
    final words = value.trim().split(RegExp(r'\s+'));
    return words.take(2).map((word) => word[0].toUpperCase()).join();
  }
}
