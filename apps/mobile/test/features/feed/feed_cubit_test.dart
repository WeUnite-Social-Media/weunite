import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/feed/domain/entities/comment.dart';
import 'package:weunite_mobile/features/feed/domain/entities/post.dart';
import 'package:weunite_mobile/features/feed/domain/repositories/feed_repository.dart';
import 'package:weunite_mobile/features/feed/feed_constants.dart';
import 'package:weunite_mobile/features/feed/presentation/cubit/feed_cubit.dart';

class _FakeFeedRepository implements FeedRepository {
  _FakeFeedRepository({
    this.toggleLikeThrows = false,
    this.nextPagePosts = const [],
  });

  final bool toggleLikeThrows;
  final List<Post> nextPagePosts;
  int toggleLikeCalls = 0;
  int getTimelineCalls = 0;

  @override
  Future<List<Post>> getTimeline({int page = 0}) async {
    getTimelineCalls++;
    return page == 0 ? const [] : nextPagePosts;
  }

  @override
  Future<List<Post>> getMyPosts({int page = 0}) async => const [];

  @override
  Future<void> createPost({
    required String content,
    String? imagePath,
  }) async {}

  @override
  Future<void> toggleLike({required int postId}) async {
    toggleLikeCalls++;
    if (toggleLikeThrows) {
      throw const AppException('Nao foi possivel curtir a publicacao.');
    }
  }

  @override
  Future<List<Comment>> getComments({
    required int postId,
    int page = 0,
  }) async =>
      const [];

  @override
  Future<void> createComment({
    required int postId,
    required String content,
  }) async {}
}

void main() {
  final post = Post(
    id: 1,
    content: 'Ola mundo',
    authorName: 'Ana',
    authorUsername: 'ana',
    createdAt: DateTime(2024, 1, 1),
  );

  group('FeedCubit.toggleLike', () {
    blocTest<FeedCubit, FeedState>(
      'keeps the post list and emits actionErrorMessage when the repository '
      'call fails',
      build: () => FeedCubit(_FakeFeedRepository(toggleLikeThrows: true)),
      seed: () => FeedState(posts: [post], hasLoaded: true),
      act: (cubit) => cubit.toggleLike(postId: post.id),
      expect: () => [
        FeedState(
          posts: [post.copyWith(likedByViewer: true, likesCount: 1)],
          hasLoaded: true,
          pendingLikes: const {1},
        ),
        FeedState(
          posts: [post],
          hasLoaded: true,
          actionErrorMessage: 'Nao foi possivel curtir a publicacao.',
        ),
      ],
    );

    blocTest<FeedCubit, FeedState>(
      'keeps the optimistic like when the repository call succeeds',
      build: () => FeedCubit(_FakeFeedRepository()),
      seed: () => FeedState(posts: [post], hasLoaded: true),
      act: (cubit) => cubit.toggleLike(postId: post.id),
      expect: () => [
        FeedState(
          posts: [post.copyWith(likedByViewer: true, likesCount: 1)],
          hasLoaded: true,
          pendingLikes: const {1},
        ),
        FeedState(
          posts: [post.copyWith(likedByViewer: true, likesCount: 1)],
          hasLoaded: true,
        ),
      ],
    );

    test(
        'a second toggle while the first is pending calls the repository '
        'only once', () async {
      final repository = _FakeFeedRepository();
      final cubit = FeedCubit(repository)
        ..emit(FeedState(posts: [post], hasLoaded: true));

      final first = cubit.toggleLike(postId: post.id);
      final second = cubit.toggleLike(postId: post.id);
      await Future.wait([first, second]);

      expect(repository.toggleLikeCalls, 1);
      await cubit.close();
    });
  });

  group('FeedCubit.loadNextPage', () {
    blocTest<FeedCubit, FeedState>(
      'does nothing when hasMore is false',
      build: () => FeedCubit(_FakeFeedRepository()),
      seed: () => const FeedState(hasLoaded: true, hasMore: false),
      act: (cubit) => cubit.loadNextPage(),
      expect: () => const <FeedState>[],
    );

    blocTest<FeedCubit, FeedState>(
      'sets hasMore to false when the page returns fewer than '
      'kFeedPageSize posts',
      build: () => FeedCubit(
        _FakeFeedRepository(
          nextPagePosts: List.generate(
            kFeedPageSize - 1,
            (index) => post,
          ),
        ),
      ),
      seed: () => const FeedState(hasLoaded: true),
      act: (cubit) => cubit.loadNextPage(),
      expect: () => [
        isA<FeedState>()
            .having((state) => state.isLoadingMore, 'isLoadingMore', true),
        isA<FeedState>()
            .having((state) => state.isLoadingMore, 'isLoadingMore', false)
            .having((state) => state.hasMore, 'hasMore', false)
            .having((state) => state.page, 'page', 1),
      ],
    );
  });
}
