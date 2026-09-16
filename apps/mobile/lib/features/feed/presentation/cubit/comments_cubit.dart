import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/comment.dart';
import '../../domain/repositories/feed_repository.dart';
import '../../feed_constants.dart';

part 'comments_state.dart';

class CommentsCubit extends Cubit<CommentsState> {
  CommentsCubit({
    required int postId,
    required FeedRepository repository,
  })  : _postId = postId,
        _repository = repository,
        super(const CommentsState());

  final int _postId;
  final FeedRepository _repository;

  Future<void> loadComments() async {
    final hadComments = state.comments.isNotEmpty;
    emit(
      state.copyWith(
        isLoading: !hadComments,
        page: 0,
        hasMore: true,
        loadErrorMessage: () => null,
        actionErrorMessage: () => null,
      ),
    );
    try {
      final comments = await _repository.getComments(
        postId: _postId,
        page: 0,
      );
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          comments: comments,
          page: 0,
          hasMore: comments.length >= kFeedPageSize,
        ),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          loadErrorMessage: hadComments ? null : () => error.message,
          actionErrorMessage: hadComments ? () => error.message : null,
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
      final comments = await _repository.getComments(
        postId: _postId,
        page: nextPage,
      );
      emit(
        state.copyWith(
          isLoadingMore: false,
          comments: [...state.comments, ...comments],
          page: nextPage,
          hasMore: comments.length >= kFeedPageSize,
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

  Future<void> createComment({required String content}) async {
    emit(state.copyWith(isSubmitting: true, actionErrorMessage: () => null));
    try {
      await _repository.createComment(postId: _postId, content: content);
      final comments = await _repository.getComments(
        postId: _postId,
        page: 0,
      );
      emit(
        state.copyWith(
          isSubmitting: false,
          comments: comments,
          page: 0,
          hasMore: comments.length >= kFeedPageSize,
          commentCreatedTick: state.commentCreatedTick + 1,
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
