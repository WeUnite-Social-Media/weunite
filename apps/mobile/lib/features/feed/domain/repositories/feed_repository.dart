import '../entities/comment.dart';
import '../entities/post.dart';

abstract class FeedRepository {
  Future<List<Post>> getTimeline({int page = 0});
  Future<void> createPost({required String content});
  Future<void> toggleLike({required int postId});
  Future<List<Comment>> getComments({required int postId, int page = 0});
  Future<void> createComment({
    required int postId,
    required String content,
  });
}
