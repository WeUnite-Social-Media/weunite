import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/widgets/async_state_view.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../cubit/feed_cubit.dart';
import '../widgets/create_post_sheet.dart';
import '../widgets/comments_sheet.dart';
import '../widgets/post_card.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    context.read<FeedCubit>().loadTimeline();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController
      ..removeListener(_onScroll)
      ..dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) {
      return;
    }
    final position = _scrollController.position;
    if (position.extentAfter < 320) {
      context.read<FeedCubit>().loadNextPage();
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FeedCubit, FeedState>(
      builder: (context, state) {
        final userId = context.read<AuthCubit>().state.user?.id;
        return Scaffold(
          body: AsyncStateView(
            isLoading: state.isLoading,
            errorMessage: state.errorMessage,
            onRetry: context.read<FeedCubit>().loadTimeline,
            child: RefreshIndicator(
              onRefresh: context.read<FeedCubit>().loadTimeline,
              child: ListView.separated(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: state.posts.length + (state.isLoadingMore ? 1 : 0),
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  if (index >= state.posts.length) {
                    return const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16),
                      child: Center(child: CircularProgressIndicator()),
                    );
                  }
                  final post = state.posts[index];
                  return PostCard(
                    post: post,
                    onLike: userId == null
                        ? null
                        : () => context.read<FeedCubit>().toggleLike(
                              userId: userId,
                              postId: post.id,
                            ),
                    onComments: () => showModalBottomSheet<void>(
                      context: context,
                      isScrollControlled: true,
                      builder: (_) => CommentsSheet(postId: post.id),
                    ),
                  );
                },
              ),
            ),
          ),
          floatingActionButton: FloatingActionButton(
            onPressed: userId == null
                ? null
                : () => showModalBottomSheet<void>(
                      context: context,
                      isScrollControlled: true,
                      builder: (_) => CreatePostSheet(userId: userId),
                    ),
            child: const Icon(Icons.add),
          ),
        );
      },
    );
  }
}
