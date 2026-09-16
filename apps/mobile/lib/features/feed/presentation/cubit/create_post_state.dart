part of 'create_post_cubit.dart';

class CreatePostState extends Equatable {
  const CreatePostState({
    this.isSubmitting = false,
    this.errorMessage,
    this.isSuccess = false,
  });

  final bool isSubmitting;
  final String? errorMessage;
  final bool isSuccess;

  CreatePostState copyWith({
    bool? isSubmitting,
    ValueGetter<String?>? errorMessage,
    bool? isSuccess,
  }) {
    return CreatePostState(
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: errorMessage != null ? errorMessage() : this.errorMessage,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }

  @override
  List<Object?> get props => [isSubmitting, errorMessage, isSuccess];
}
