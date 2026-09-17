import '../entities/comment.dart';
import '../entities/post.dart';

abstract class FeedRepository {
  Future<List<Post>> getTimeline({int page = 0});

  /// Posts authored by the signed-in user, newest first.
  Future<List<Post>> getMyPosts({int page = 0});

  /// [imagePath] is a local file path (e.g. from the gallery picker); when
  /// present the image is uploaded together with the post.
  Future<void> createPost({required String content, String? imagePath});
  Future<void> toggleLike({required int postId});
  Future<List<Comment>> getComments({required int postId, int page = 0});
  Future<void> createComment({
    required int postId,
    required String content,
  });
}
