import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/feed/domain/entities/comment.dart';
import 'package:weunite_mobile/features/feed/domain/entities/post.dart';
import 'package:weunite_mobile/features/feed/domain/post_events.dart';
import 'package:weunite_mobile/features/feed/domain/repositories/feed_repository.dart';
import 'package:weunite_mobile/features/feed/presentation/cubit/feed_cubit.dart';
import 'package:weunite_mobile/features/profile/presentation/cubit/profile_posts_cubit.dart';

Post _post(int id, {int likes = 0, int comments = 0, bool liked = false}) {
  return Post(
    id: id,
    content: 'Post $id',
    authorName: 'Caio Godas',
    authorUsername: 'caiogodas',
    createdAt: DateTime.utc(2026, 9, 17),
    likesCount: likes,
    commentsCount: comments,
    likedByViewer: liked,
  );
}

class _FakeFeedRepository implements FeedRepository {
  List<Post> myPosts = [_post(1)];
  List<Post> timeline = [_post(1)];
  int getMyPostsCalls = 0;
  int toggleLikeCalls = 0;
  bool toggleLikeThrows = false;

  @override
  Future<List<Post>> getTimeline({int page = 0}) async =>
      page == 0 ? timeline : const [];

  @override
  Future<List<Post>> getMyPosts({int page = 0}) async {
    getMyPostsCalls++;
    return page == 0 ? myPosts : const [];
  }

  List<Post> otherUserPosts = [_post(9)];
  final getUserPostsCalls = <int>[];

  @override
  Future<List<Post>> getUserPosts({required int userId, int page = 0}) async {
    getUserPostsCalls.add(userId);
    return page == 0 ? otherUserPosts : const [];
  }

  @override
  Future<void> createPost({required String content, String? imagePath}) async {}

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
  group('ProfilePostsCubit', () {
    blocTest<ProfilePostsCubit, ProfilePostsState>(
      'loads the signed-in user posts',
      build: () => ProfilePostsCubit(_FakeFeedRepository()),
      act: (cubit) => cubit.loadPosts(),
      expect: () => [
        const ProfilePostsState(isLoading: true),
        ProfilePostsState(hasLoaded: true, posts: [_post(1)], hasMore: false),
      ],
    );

    test('reloads its posts when a new post is created', () async {
      final repository = _FakeFeedRepository();
      final events = PostEvents();
      final cubit = ProfilePostsCubit(repository, events: events);
      await cubit.loadPosts();

      repository.myPosts = [_post(2), _post(1)];
      events.postCreated();
      await pumpEventQueue();

      expect(repository.getMyPostsCalls, 2);
      expect(cubit.state.posts.map((post) => post.id), [2, 1]);

      await cubit.close();
      await events.dispose();
    });

    test('does not fetch on post creation before the tab has loaded', () async {
      final repository = _FakeFeedRepository();
      final events = PostEvents();
      final cubit = ProfilePostsCubit(repository, events: events);

      events.postCreated();
      await pumpEventQueue();

      expect(repository.getMyPostsCalls, 0);

      await cubit.close();
      await events.dispose();
    });

    test('bumps the comment counter when a comment is added', () async {
      final events = PostEvents();
      final cubit = ProfilePostsCubit(_FakeFeedRepository(), events: events);
      await cubit.loadPosts();

      events.commentAdded(1);
      await pumpEventQueue();

      expect(cubit.state.posts.single.commentsCount, 1);

      await cubit.close();
      await events.dispose();
    });

    blocTest<ProfilePostsCubit, ProfilePostsState>(
      'reverts an optimistic like when the API call fails',
      build: () => ProfilePostsCubit(
        _FakeFeedRepository()..toggleLikeThrows = true,
      ),
      seed: () => ProfilePostsState(hasLoaded: true, posts: [_post(1)]),
      act: (cubit) => cubit.toggleLike(postId: 1),
      expect: () => [
        ProfilePostsState(
          hasLoaded: true,
          posts: [_post(1, likes: 1, liked: true)],
          pendingLikes: const {1},
        ),
        ProfilePostsState(
          hasLoaded: true,
          posts: [_post(1)],
          actionErrorMessage: 'Nao foi possivel curtir a publicacao.',
        ),
      ],
    );
  });

  group('ProfilePostsCubit for another user', () {
    test('loads that user posts instead of the signed-in user posts', () async {
      final repository = _FakeFeedRepository();
      final cubit = ProfilePostsCubit(repository, userId: 42);

      await cubit.loadPosts();

      expect(repository.getUserPostsCalls, [42]);
      expect(repository.getMyPostsCalls, 0);
      expect(cubit.state.posts.single.id, 9);

      await cubit.close();
    });

    test('does not reload when the signed-in user publishes a post', () async {
      final repository = _FakeFeedRepository();
      final events = PostEvents();
      final cubit = ProfilePostsCubit(repository, events: events, userId: 42);
      await cubit.loadPosts();

      events.postCreated();
      await pumpEventQueue();

      expect(repository.getUserPostsCalls, [42]);

      await cubit.close();
      await events.dispose();
    });

    test('a like on their profile shows up in the feed', () async {
      final repository = _FakeFeedRepository()..timeline = [_post(9)];
      final events = PostEvents();
      final feed = FeedCubit(repository, events: events);
      final profile = ProfilePostsCubit(repository, events: events, userId: 42);
      await feed.loadTimeline();
      await profile.loadPosts();

      await profile.toggleLike(postId: 9);
      await pumpEventQueue();

      expect(feed.state.posts.single.likedByViewer, isTrue);

      await feed.close();
      await profile.close();
      await events.dispose();
    });
  });

  group('feed and profile stay in sync through PostEvents', () {
    test('a like in the feed shows up on the profile post', () async {
      final repository = _FakeFeedRepository();
      final events = PostEvents();
      final feed = FeedCubit(repository, events: events);
      final profile = ProfilePostsCubit(repository, events: events);
      await feed.loadTimeline();
      await profile.loadPosts();

      await feed.toggleLike(postId: 1);
      await pumpEventQueue();

      expect(repository.toggleLikeCalls, 1);
      expect(profile.state.posts.single.likedByViewer, isTrue);
      expect(profile.state.posts.single.likesCount, 1);

      await feed.close();
      await profile.close();
      await events.dispose();
    });

    test('a like on the profile shows up in the feed', () async {
      final repository = _FakeFeedRepository();
      final events = PostEvents();
      final feed = FeedCubit(repository, events: events);
      final profile = ProfilePostsCubit(repository, events: events);
      await feed.loadTimeline();
      await profile.loadPosts();

      await profile.toggleLike(postId: 1);
      await pumpEventQueue();

      expect(repository.toggleLikeCalls, 1);
      expect(feed.state.posts.single.likedByViewer, isTrue);

      await feed.close();
      await profile.close();
      await events.dispose();
    });

    test('creating a post reloads both the feed and the profile', () async {
      final repository = _FakeFeedRepository();
      final events = PostEvents();
      final feed = FeedCubit(repository, events: events);
      final profile = ProfilePostsCubit(repository, events: events);
      await feed.loadTimeline();
      await profile.loadPosts();

      repository
        ..timeline = [_post(2), _post(1)]
        ..myPosts = [_post(2), _post(1)];
      events.postCreated();
      await pumpEventQueue();

      expect(feed.state.posts.map((post) => post.id), [2, 1]);
      expect(profile.state.posts.map((post) => post.id), [2, 1]);

      await feed.close();
      await profile.close();
      await events.dispose();
    });

    test('a comment counts once in both lists', () async {
      final repository = _FakeFeedRepository();
      final events = PostEvents();
      final feed = FeedCubit(repository, events: events);
      final profile = ProfilePostsCubit(repository, events: events);
      await feed.loadTimeline();
      await profile.loadPosts();

      events.commentAdded(1);
      await pumpEventQueue();

      expect(feed.state.posts.single.commentsCount, 1);
      expect(profile.state.posts.single.commentsCount, 1);

      await feed.close();
      await profile.close();
      await events.dispose();
    });
  });
}
