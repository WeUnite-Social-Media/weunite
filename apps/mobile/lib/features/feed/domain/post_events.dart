import 'dart:async';

import 'entities/post.dart';

sealed class PostEvent {
  const PostEvent();
}

/// The signed-in user published a new post; post lists should reload.
final class PostCreated extends PostEvent {
  const PostCreated();
}

/// A post already on screen changed locally (e.g. like toggled). Lists
/// holding a post with the same id replace it with [post].
final class PostUpdated extends PostEvent {
  const PostUpdated(this.post);

  final Post post;
}

/// A comment was created on [postId]; lists holding it bump its counter.
final class PostCommentAdded extends PostEvent {
  const PostCommentAdded(this.postId);

  final int postId;
}

/// Session-scoped bus that keeps every post list (feed, own profile) in sync
/// without each screen having to know about the others.
class PostEvents {
  final _controller = StreamController<PostEvent>.broadcast();

  Stream<PostEvent> get stream => _controller.stream;

  void postCreated() => _add(const PostCreated());

  void postUpdated(Post post) => _add(PostUpdated(post));

  void commentAdded(int postId) => _add(PostCommentAdded(postId));

  void _add(PostEvent event) {
    if (!_controller.isClosed) {
      _controller.add(event);
    }
  }

  Future<void> dispose() => _controller.close();
}
