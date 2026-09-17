import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../../feed/domain/entities/post.dart';
import '../../../feed/domain/post_events.dart';
import '../../../feed/domain/repositories/feed_repository.dart';
import '../../../feed/feed_constants.dart';

part 'profile_posts_state.dart';

/// Posts authored by one user, shown on the "Posts" tab of a profile.
///
/// Without [userId] it lists the signed-in user's own posts (session-scoped,
/// like `ProfileCubit`); with it, another user's posts (route-scoped, on
/// `/profile/:userId`). Kept in sync with the feed through [PostEvents]:
/// likes and comments made elsewhere update the matching post in place, and
/// a new post reloads the signed-in user's own list.
class ProfilePostsCubit extends Cubit<ProfilePostsState> {
  ProfilePostsCubit(this._repository, {PostEvents? events, this.userId})
      : _events = events,
        super(const ProfilePostsState()) {
    _eventsSubscription = events?.stream.listen(_onPostEvent);
  }

  final FeedRepository _repository;
  final PostEvents? _events;

  /// Author whose posts are listed; `null` means the signed-in user.
  final int? userId;
  StreamSubscription<PostEvent>? _eventsSubscription;

  Future<List<Post>> _fetch(int page) {
    final id = userId;
    return id == null
        ? _repository.getMyPosts(page: page)
        : _repository.getUserPosts(userId: id, page: page);
  }

  Future<void> loadPosts() async {
    final hadPosts = state.posts.isNotEmpty;
    emit(
      state.copyWith(
        isLoading: !hadPosts,
        page: 0,
        hasMore: true,
        loadErrorMessage: () => null,
        actionErrorMessage: () => null,
      ),
    );
    try {
      final posts = await _fetch(0);
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          posts: posts,
          page: 0,
          hasMore: posts.length >= kFeedPageSize,
        ),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          loadErrorMessage: hadPosts ? null : () => error.message,
          actionErrorMessage: hadPosts ? () => error.message : null,
        ),
      );
    }
  }

  Future<void> loadNextPage() async {
    if (state.isLoading || state.isLoadingMore || !state.hasMore) {
      return;
    }

    final nextPage = state.page + 1;
    emit(state.copyWith(isLoadingMore: true, actionErrorMessage: () => null));
    try {
      final posts = await _fetch(nextPage);
      emit(
        state.copyWith(
          isLoadingMore: false,
          posts: [...state.posts, ...posts],
          page: nextPage,
          hasMore: posts.length >= kFeedPageSize,
        ),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          isLoadingMore: false,
          actionErrorMessage: () => error.message,
        ),
      );
    }
  }

  Future<void> toggleLike({required int postId}) async {
    if (state.pendingLikes.contains(postId)) {
      return;
    }

    final previousPosts = state.posts;
    emit(
      state.copyWith(
        posts: [
          for (final post in previousPosts)
            if (post.id == postId) _withToggledLike(post) else post,
        ],
        pendingLikes: {...state.pendingLikes, postId},
        actionErrorMessage: () => null,
      ),
    );
    _publishPost(postId);
    try {
      await _repository.toggleLike(postId: postId);
      emit(
        state.copyWith(pendingLikes: {...state.pendingLikes}..remove(postId)),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          posts: previousPosts,
          pendingLikes: {...state.pendingLikes}..remove(postId),
          actionErrorMessage: () => error.message,
        ),
      );
      _publishPost(postId);
    }
  }

  void dismissActionError() {
    if (state.actionErrorMessage == null) {
      return;
    }
    emit(state.copyWith(actionErrorMessage: () => null));
  }

  Post _withToggledLike(Post post) {
    final liked = !post.likedByViewer;
    final likes = liked ? post.likesCount + 1 : post.likesCount - 1;
    return post.copyWith(
      likedByViewer: liked,
      likesCount: likes < 0 ? 0 : likes,
    );
  }

  void _onPostEvent(PostEvent event) {
    switch (event) {
      case PostCreated():
        // Only the signed-in user publishes, so only their own list changes.
        // Before the tab has loaded, its first visit fetches fresh data.
        if (userId == null && state.hasLoaded) {
          loadPosts();
        }
      case PostUpdated(:final post):
        _updatePost(post.id, (_) => post);
      case PostCommentAdded(:final postId):
        _updatePost(
          postId,
          (post) => post.copyWith(commentsCount: post.commentsCount + 1),
        );
    }
  }

  void _updatePost(int postId, Post Function(Post post) update) {
    if (!state.posts.any((post) => post.id == postId)) {
      return;
    }
    emit(
      state.copyWith(
        posts: [
          for (final post in state.posts)
            if (post.id == postId) update(post) else post,
        ],
      ),
    );
  }

  void _publishPost(int postId) {
    final events = _events;
    if (events == null) {
      return;
    }
    for (final post in state.posts) {
      if (post.id == postId) {
        events.postUpdated(post);
        return;
      }
    }
  }

  @override
  Future<void> close() async {
    await _eventsSubscription?.cancel();
    return super.close();
  }
}
