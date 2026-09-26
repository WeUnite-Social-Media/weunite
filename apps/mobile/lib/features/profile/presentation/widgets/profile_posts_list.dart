import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../feed/presentation/widgets/comments_sheet.dart';
import '../../../feed/presentation/widgets/post_card.dart';
import '../cubit/profile_posts_cubit.dart';

/// Posts of the [ProfilePostsCubit] in scope, rendered inline (not
/// scrollable) so it can sit inside a profile page's `ListView`.
class ProfilePostsList extends StatelessWidget {
  const ProfilePostsList({required this.emptyMessage, super.key});

  final String emptyMessage;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfilePostsCubit, ProfilePostsState>(
      builder: (context, state) {
        if (state.isLoading || (!state.hasLoaded && state.posts.isEmpty)) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 48),
            child: Center(child: CircularProgressIndicator()),
          );
        }
        if (state.loadErrorMessage != null) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 16),
            child: Column(
              children: [
                Text(state.loadErrorMessage!, textAlign: TextAlign.center),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: context.read<ProfilePostsCubit>().loadPosts,
                  child: const Text('Tentar novamente'),
                ),
              ],
            ),
          );
        }
        if (state.posts.isEmpty) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 16),
            child:
                Center(child: Text(emptyMessage, textAlign: TextAlign.center)),
          );
        }
        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (final post in state.posts) ...[
                PostCard(
                  post: post,
                  // Every post here belongs to the profile being viewed.
                  enableAuthorNavigation: false,
                  onLike: () => context
                      .read<ProfilePostsCubit>()
                      .toggleLike(postId: post.id),
                  onComments: () => showCommentsSheet(context, postId: post.id),
                ),
                const SizedBox(height: 12),
              ],
              if (state.isLoadingMore)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Center(child: CircularProgressIndicator()),
                ),
            ],
          ),
        );
      },
    );
  }
}
