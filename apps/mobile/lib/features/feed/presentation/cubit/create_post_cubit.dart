import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/repositories/feed_repository.dart';

part 'create_post_state.dart';

class CreatePostCubit extends Cubit<CreatePostState> {
  CreatePostCubit(this._repository) : super(const CreatePostState());

  final FeedRepository _repository;

  Future<void> submit({required String content}) async {
    emit(state.copyWith(isSubmitting: true, errorMessage: () => null));
    try {
      await _repository.createPost(content: content);
      emit(state.copyWith(isSubmitting: false, isSuccess: true));
    } on AppException catch (error) {
      emit(
        state.copyWith(
          isSubmitting: false,
          errorMessage: () => error.message,
        ),
      );
    }
  }
}
