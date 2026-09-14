part of 'feed_cubit.dart';

class FeedState extends Equatable {
  const FeedState({
    this.posts = const [],
    this.isLoading = false,
    this.errorMessage,
  });

  final List<Post> posts;
  final bool isLoading;
  final String? errorMessage;

  FeedState copyWith({
    List<Post>? posts,
    bool? isLoading,
    String? errorMessage,
  }) {
    return FeedState(
      posts: posts ?? this.posts,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [posts, isLoading, errorMessage];
}
