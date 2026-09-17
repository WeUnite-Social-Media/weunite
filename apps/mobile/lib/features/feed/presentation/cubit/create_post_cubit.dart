import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/repositories/feed_repository.dart';

part 'create_post_state.dart';

class CreatePostCubit extends Cubit<CreatePostState> {
  CreatePostCubit(this._repository) : super(const CreatePostState());

  final FeedRepository _repository;

  void selectImage(String path) {
    emit(state.copyWith(imagePath: () => path, errorMessage: () => null));
  }

  void removeImage() {
    emit(state.copyWith(imagePath: () => null));
  }

  /// Shows a validation message that did not come from the API (e.g. the
  /// picked file is too large).
  void reportError(String message) {
    emit(state.copyWith(errorMessage: () => message));
  }

  Future<void> submit({required String content}) async {
    if (state.isSubmitting) {
      return;
    }
    if (content.isEmpty && state.imagePath == null) {
      return;
    }
    emit(state.copyWith(isSubmitting: true, errorMessage: () => null));
    try {
      await _repository.createPost(
        content: content,
        imagePath: state.imagePath,
      );
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
