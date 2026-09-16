import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/feed/domain/entities/comment.dart';
import 'package:weunite_mobile/features/feed/domain/entities/post.dart';
import 'package:weunite_mobile/features/feed/domain/repositories/feed_repository.dart';
import 'package:weunite_mobile/features/feed/presentation/cubit/create_post_cubit.dart';

class _FakeFeedRepository implements FeedRepository {
  _FakeFeedRepository({this.createPostThrows = false});

  final bool createPostThrows;

  @override
  Future<List<Post>> getTimeline({int page = 0}) async => const [];

  @override
  Future<void> createPost({required String content}) async {
    if (createPostThrows) {
      throw const AppException('Nao foi possivel publicar.');
    }
  }

  @override
  Future<void> toggleLike({required int postId}) async {}

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
  group('CreatePostCubit.submit', () {
    blocTest<CreatePostCubit, CreatePostState>(
      'emits isSuccess when the repository call succeeds',
      build: () => CreatePostCubit(_FakeFeedRepository()),
      act: (cubit) => cubit.submit(content: 'Ola mundo'),
      expect: () => const [
        CreatePostState(isSubmitting: true),
        CreatePostState(isSuccess: true),
      ],
    );

    blocTest<CreatePostCubit, CreatePostState>(
      'emits errorMessage when the repository call fails',
      build: () => CreatePostCubit(_FakeFeedRepository(createPostThrows: true)),
      act: (cubit) => cubit.submit(content: 'Ola mundo'),
      expect: () => const [
        CreatePostState(isSubmitting: true),
        CreatePostState(errorMessage: 'Nao foi possivel publicar.'),
      ],
    );
  });
}
