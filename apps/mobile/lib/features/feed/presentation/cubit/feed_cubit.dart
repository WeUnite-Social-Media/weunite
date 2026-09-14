import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/post.dart';
import '../../domain/repositories/feed_repository.dart';

part 'feed_state.dart';

class FeedCubit extends Cubit<FeedState> {
  FeedCubit(this._repository) : super(const FeedState());

  final FeedRepository _repository;

  Future<void> loadTimeline() async {
    emit(state.copyWith(isLoading: true, errorMessage: null));
    try {
      final posts = await _repository.getTimeline();
      emit(state.copyWith(isLoading: false, posts: posts));
    } on AppException catch (error) {
      emit(state.copyWith(isLoading: false, errorMessage: error.message));
    }
  }

  Future<void> toggleLike({required int userId, required int postId}) async {
    await _repository.toggleLike(userId: userId, postId: postId);
    await loadTimeline();
  }
}
