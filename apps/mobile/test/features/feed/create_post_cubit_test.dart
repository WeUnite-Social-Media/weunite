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
  final createPostCalls = <({String content, String? imagePath})>[];

  @override
  Future<List<Post>> getTimeline({int page = 0}) async => const [];

  @override
  Future<List<Post>> getMyPosts({int page = 0}) async => const [];

  @override
  Future<void> createPost({required String content, String? imagePath}) async {
    createPostCalls.add((content: content, imagePath: imagePath));
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

    final withImage = _FakeFeedRepository();
    blocTest<CreatePostCubit, CreatePostState>(
      'sends the selected image path with the post',
      build: () => CreatePostCubit(withImage),
      act: (cubit) async {
        cubit.selectImage('/tmp/foto.jpg');
        await cubit.submit(content: 'Com foto');
      },
      expect: () => const [
        CreatePostState(imagePath: '/tmp/foto.jpg'),
        CreatePostState(isSubmitting: true, imagePath: '/tmp/foto.jpg'),
        CreatePostState(isSuccess: true, imagePath: '/tmp/foto.jpg'),
      ],
      verify: (_) {
        expect(withImage.createPostCalls, [
          (content: 'Com foto', imagePath: '/tmp/foto.jpg'),
        ]);
      },
    );

    final imageOnly = _FakeFeedRepository();
    blocTest<CreatePostCubit, CreatePostState>(
      'allows publishing an image without text',
      build: () => CreatePostCubit(imageOnly),
      act: (cubit) async {
        cubit.selectImage('/tmp/foto.png');
        await cubit.submit(content: '');
      },
      skip: 1,
      expect: () => const [
        CreatePostState(isSubmitting: true, imagePath: '/tmp/foto.png'),
        CreatePostState(isSuccess: true, imagePath: '/tmp/foto.png'),
      ],
      verify: (_) {
        expect(imageOnly.createPostCalls.single.imagePath, '/tmp/foto.png');
      },
    );

    final empty = _FakeFeedRepository();
    blocTest<CreatePostCubit, CreatePostState>(
      'ignores a submit with neither text nor image',
      build: () => CreatePostCubit(empty),
      act: (cubit) => cubit.submit(content: ''),
      expect: () => const <CreatePostState>[],
      verify: (_) => expect(empty.createPostCalls, isEmpty),
    );

    final removed = _FakeFeedRepository();
    blocTest<CreatePostCubit, CreatePostState>(
      'does not send an image that was removed before publishing',
      build: () => CreatePostCubit(removed),
      act: (cubit) async {
        cubit
          ..selectImage('/tmp/foto.jpg')
          ..removeImage();
        await cubit.submit(content: 'Sem foto');
      },
      verify: (_) {
        expect(removed.createPostCalls.single.imagePath, isNull);
      },
    );
  });
}
