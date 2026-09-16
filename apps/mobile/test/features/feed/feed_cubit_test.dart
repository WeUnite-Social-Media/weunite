import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/feed/domain/entities/comment.dart';
import 'package:weunite_mobile/features/feed/domain/entities/post.dart';
import 'package:weunite_mobile/features/feed/domain/repositories/feed_repository.dart';
import 'package:weunite_mobile/features/feed/presentation/cubit/feed_cubit.dart';

class _FakeFeedRepository implements FeedRepository {
  _FakeFeedRepository({this.toggleLikeThrows = false});

  final bool toggleLikeThrows;

  @override
  Future<List<Post>> getTimeline({int page = 0}) async => const [];

  @override
  Future<void> createPost({required String content}) async {}

  @override
  Future<void> toggleLike({required int postId}) async {
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
        ),
      ],
    );
  });
}
