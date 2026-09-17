import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/feed/domain/entities/comment.dart';
import 'package:weunite_mobile/features/feed/domain/entities/post.dart';
import 'package:weunite_mobile/features/feed/domain/repositories/feed_repository.dart';
import 'package:weunite_mobile/features/feed/presentation/cubit/comments_cubit.dart';

class _FakeFeedRepository implements FeedRepository {
  _FakeFeedRepository({this.createCommentThrows = false});

  final bool createCommentThrows;
  final List<Comment> commentsAfterCreate = [
    Comment(
      id: 1,
      content: 'Primeiro comentario',
      authorName: 'Ana',
      authorUsername: 'ana',
      createdAt: DateTime(2024, 1, 1),
    ),
  ];
  int getCommentsCalls = 0;

  @override
  Future<List<Post>> getTimeline({int page = 0}) async => const [];

  @override
  Future<List<Post>> getMyPosts({int page = 0}) async => const [];

  @override
  Future<List<Post>> getUserPosts({required int userId, int page = 0}) async =>
      const [];

  @override
  Future<List<Post>> searchPosts({required String query, int page = 0}) async =>
      const [];

  @override
  Future<void> createPost({
    required String content,
    String? imagePath,
  }) async {}

  @override
  Future<void> toggleLike({required int postId}) async {}

  @override
  Future<List<Comment>> getComments({
    required int postId,
    int page = 0,
  }) async {
    getCommentsCalls++;
    return commentsAfterCreate;
  }

  @override
  Future<void> createComment({
    required int postId,
    required String content,
  }) async {
    if (createCommentThrows) {
      throw const AppException('Nao foi possivel comentar.');
    }
  }
}

void main() {
  group('CommentsCubit.createComment', () {
    blocTest<CommentsCubit, CommentsState>(
      'creates the comment and reloads the list',
      build: () => CommentsCubit(
        postId: 1,
        repository: _FakeFeedRepository(),
      ),
      act: (cubit) => cubit.createComment(content: 'Ola'),
      expect: () => [
        isA<CommentsState>()
            .having((state) => state.isSubmitting, 'isSubmitting', true),
        isA<CommentsState>()
            .having((state) => state.isSubmitting, 'isSubmitting', false)
            .having((state) => state.comments.length, 'comments.length', 1)
            .having(
              (state) => state.commentCreatedTick,
              'commentCreatedTick',
              1,
            ),
      ],
    );

    blocTest<CommentsCubit, CommentsState>(
      'emits actionErrorMessage and does not bump commentCreatedTick when '
      'the repository call fails',
      build: () => CommentsCubit(
        postId: 1,
        repository: _FakeFeedRepository(createCommentThrows: true),
      ),
      act: (cubit) => cubit.createComment(content: 'Ola'),
      expect: () => [
        isA<CommentsState>()
            .having((state) => state.isSubmitting, 'isSubmitting', true),
        isA<CommentsState>()
            .having((state) => state.isSubmitting, 'isSubmitting', false)
            .having(
              (state) => state.actionErrorMessage,
              'actionErrorMessage',
              'Nao foi possivel comentar.',
            )
            .having(
              (state) => state.commentCreatedTick,
              'commentCreatedTick',
              0,
            ),
      ],
    );
  });
}
