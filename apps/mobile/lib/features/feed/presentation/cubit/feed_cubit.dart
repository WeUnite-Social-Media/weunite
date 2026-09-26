import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/post.dart';
import '../../domain/post_events.dart';
import '../../domain/repositories/feed_repository.dart';
import '../../feed_constants.dart';

part 'feed_state.dart';

class FeedCubit extends Cubit<FeedState> {
  FeedCubit(this._repository, {PostEvents? events})
      : _events = events,
        super(const FeedState()) {
    _eventsSubscription = events?.stream.listen(_onPostEvent);
  }

  final FeedRepository _repository;
  final PostEvents? _events;
  StreamSubscription<PostEvent>? _eventsSubscription;

  void _onPostEvent(PostEvent event) {
    switch (event) {
      case PostCreated():
        loadTimeline();
      case PostUpdated(:final post):
        _replacePost(post);
      case PostCommentAdded(:final postId):
        onCommentAdded(postId);
    }
  }

  void _replacePost(Post updated) {
    if (!state.posts.any((post) => post.id == updated.id)) {
      return;
    }
    emit(
      state.copyWith(
        posts: [
          for (final post in state.posts)
            if (post.id == updated.id) updated else post,
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

  Future<void> loadTimeline() async {
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
      final posts = await _repository.getTimeline(page: 0);
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
      final posts = await _repository.getTimeline(page: nextPage);
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
    final nextPosts = previousPosts.map((post) {
      if (post.id != postId) {
        return post;
      }
      final nextLiked = !post.likedByViewer;
      final nextLikes = nextLiked ? post.likesCount + 1 : post.likesCount - 1;
      return post.copyWith(
        likedByViewer: nextLiked,
        likesCount: nextLikes < 0 ? 0 : nextLikes,
      );
    }).toList();

    emit(
      state.copyWith(
        posts: nextPosts,
        pendingLikes: {...state.pendingLikes, postId},
        actionErrorMessage: () => null,
      ),
    );
    _publishPost(postId);
    try {
      await _repository.toggleLike(postId: postId);
      emit(
        state.copyWith(
          pendingLikes: {...state.pendingLikes}..remove(postId),
        ),
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

  void onCommentAdded(int postId) {
    final posts = state.posts.map((post) {
      if (post.id != postId) {
        return post;
      }
      return post.copyWith(commentsCount: post.commentsCount + 1);
    }).toList();
    emit(state.copyWith(posts: posts));
  }

  void onPostCreated() {
    loadTimeline();
  }

  void dismissActionError() {
    if (state.actionErrorMessage == null) {
      return;
    }
    emit(state.copyWith(actionErrorMessage: () => null));
  }
}
