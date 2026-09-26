import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/widgets/async_state_view.dart';
import '../../../search/presentation/widgets/home_search_bar.dart';
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
    if (!context.read<FeedCubit>().state.hasLoaded) {
      context.read<FeedCubit>().loadTimeline();
    }
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
    return BlocConsumer<FeedCubit, FeedState>(
      listener: (context, state) {
        if (state.actionErrorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.actionErrorMessage!)),
          );
          context.read<FeedCubit>().dismissActionError();
        }
      },
      builder: (context, state) {
        return Scaffold(
          body: Column(
            children: [
              const HomeSearchBar(),
              Expanded(
                child: AsyncStateView(
                  isLoading: state.isLoading,
                  errorMessage: state.loadErrorMessage,
                  onRetry: context.read<FeedCubit>().loadTimeline,
                  child: RefreshIndicator(
                    onRefresh: context.read<FeedCubit>().loadTimeline,
                    child: ListView.separated(
                      controller: _scrollController,
                      // Needed for pull-to-refresh when the posts don't fill the
                      // screen: with an explicit controller the list isn't primary
                      // and would not scroll (so never overscroll) otherwise.
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount:
                          state.posts.length + (state.isLoadingMore ? 1 : 0),
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
                          onLike: () => context.read<FeedCubit>().toggleLike(
                                postId: post.id,
                              ),
                          onComments: () =>
                              showCommentsSheet(context, postId: post.id),
                        );
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
          floatingActionButton: FloatingActionButton(
            onPressed: () => showCreatePostSheet(context),
            child: const Icon(Icons.add),
          ),
        );
      },
    );
  }
}
