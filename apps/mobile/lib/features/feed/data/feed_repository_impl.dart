import '../domain/entities/post.dart';
import '../domain/repositories/feed_repository.dart';
import 'feed_remote_data_source.dart';

class FeedRepositoryImpl implements FeedRepository {
  const FeedRepositoryImpl({required FeedRemoteDataSource remoteDataSource})
      : _remoteDataSource = remoteDataSource;

  final FeedRemoteDataSource _remoteDataSource;

  @override
  Future<List<Post>> getTimeline({int page = 0}) async {
    final posts = await _remoteDataSource.getTimeline(page: page);
    return posts.map((post) => post.toEntity()).toList();
  }

  @override
  Future<void> createPost({required int userId, required String content}) {
    return _remoteDataSource.createPost(userId: userId, content: content);
  }

  @override
  Future<void> toggleLike({required int userId, required int postId}) {
    return _remoteDataSource.toggleLike(userId: userId, postId: postId);
  }
}
