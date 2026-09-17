part of 'create_post_cubit.dart';

class CreatePostState extends Equatable {
  const CreatePostState({
    this.isSubmitting = false,
    this.errorMessage,
    this.isSuccess = false,
    this.imagePath,
  });

  final bool isSubmitting;
  final String? errorMessage;
  final bool isSuccess;

  /// Local path of the image picked to go with the post, if any.
  final String? imagePath;

  CreatePostState copyWith({
    bool? isSubmitting,
    ValueGetter<String?>? errorMessage,
    bool? isSuccess,
    ValueGetter<String?>? imagePath,
  }) {
    return CreatePostState(
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: errorMessage != null ? errorMessage() : this.errorMessage,
      isSuccess: isSuccess ?? this.isSuccess,
      imagePath: imagePath != null ? imagePath() : this.imagePath,
    );
  }

  @override
  List<Object?> get props => [isSubmitting, errorMessage, isSuccess, imagePath];
}
