import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/post.dart';
import '../../domain/repositories/feed_repository.dart';
import '../../feed_constants.dart';

part 'feed_state.dart';

class FeedCubit extends Cubit<FeedState> {
  FeedCubit(this._repository) : super(const FeedState());

  final FeedRepository _repository;

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
