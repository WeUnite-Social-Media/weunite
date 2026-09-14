import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/widgets/async_state_view.dart';
import '../cubit/feed_cubit.dart';
import '../widgets/create_post_sheet.dart';
import '../widgets/post_card.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  @override
  void initState() {
    super.initState();
    context.read<FeedCubit>().loadTimeline();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FeedCubit, FeedState>(
      builder: (context, state) {
        return Scaffold(
          body: AsyncStateView(
            isLoading: state.isLoading,
            errorMessage: state.errorMessage,
            onRetry: context.read<FeedCubit>().loadTimeline,
            child: RefreshIndicator(
              onRefresh: context.read<FeedCubit>().loadTimeline,
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: state.posts.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) => PostCard(post: state.posts[index]),
              ),
            ),
          ),
          floatingActionButton: FloatingActionButton(
            onPressed: () => showModalBottomSheet<void>(
              context: context,
              isScrollControlled: true,
              builder: (_) => const CreatePostSheet(),
            ),
            child: const Icon(Icons.add),
          ),
        );
      },
    );
  }
}
