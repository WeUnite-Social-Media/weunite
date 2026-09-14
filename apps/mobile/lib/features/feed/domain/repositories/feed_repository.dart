import '../entities/post.dart';

abstract class FeedRepository {
  Future<List<Post>> getTimeline({int page = 0});
  Future<void> createPost({required int userId, required String content});
  Future<void> toggleLike({required int userId, required int postId});
}
