import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/comment.dart';
import '../../domain/entities/post.dart';
import '../../domain/repositories/feed_repository.dart';

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
          hasMore: posts.length >= 20,
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
          hasMore: posts.length >= 20,
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

  Future<void> createPost({
    required int userId,
    required String content,
  }) async {
    emit(state.copyWith(isSubmitting: true, actionErrorMessage: () => null));
    try {
      await _repository.createPost(userId: userId, content: content);
      emit(state.copyWith(isSubmitting: false));
      await loadTimeline();
    } on AppException catch (error) {
      emit(
        state.copyWith(
          isSubmitting: false,
          actionErrorMessage: () => error.message,
        ),
      );
    }
  }

  Future<void> toggleLike({required int userId, required int postId}) async {
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

    emit(state.copyWith(posts: nextPosts, actionErrorMessage: () => null));
    try {
      await _repository.toggleLike(userId: userId, postId: postId);
    } on AppException catch (error) {
      emit(
        state.copyWith(
          posts: previousPosts,
          actionErrorMessage: () => error.message,
        ),
      );
    }
  }

  Future<void> loadComments({required int postId}) async {
    emit(state.copyWith(actionErrorMessage: () => null));
    try {
      final comments = await _repository.getComments(postId: postId);
      emit(
        state.copyWith(
          commentsByPost: {
            ...state.commentsByPost,
            postId: comments,
          },
        ),
      );
    } on AppException catch (error) {
      emit(state.copyWith(actionErrorMessage: () => error.message));
    }
  }

  Future<void> createComment({
    required int userId,
    required int postId,
    required String content,
  }) async {
    emit(state.copyWith(isSubmitting: true, actionErrorMessage: () => null));
    try {
      await _repository.createComment(
        userId: userId,
        postId: postId,
        content: content,
      );
      final comments = await _repository.getComments(postId: postId);
      final posts = state.posts.map((post) {
        if (post.id != postId) {
          return post;
        }
        return post.copyWith(commentsCount: post.commentsCount + 1);
      }).toList();

      emit(
        state.copyWith(
          isSubmitting: false,
          posts: posts,
          commentsByPost: {
            ...state.commentsByPost,
            postId: comments,
          },
        ),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          isSubmitting: false,
          actionErrorMessage: () => error.message,
        ),
      );
    }
  }

  void dismissActionError() {
    if (state.actionErrorMessage == null) {
      return;
    }
    emit(state.copyWith(actionErrorMessage: () => null));
  }
}
