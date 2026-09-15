part of 'feed_cubit.dart';

class FeedState extends Equatable {
  const FeedState({
    this.posts = const [],
    this.commentsByPost = const {},
    this.isLoading = false,
    this.isLoadingMore = false,
    this.isSubmitting = false,
    this.page = 0,
    this.hasMore = true,
    this.errorMessage,
  });

  final List<Post> posts;
  final Map<int, List<Comment>> commentsByPost;
  final bool isLoading;
  final bool isLoadingMore;
  final bool isSubmitting;
  final int page;
  final bool hasMore;
  final String? errorMessage;

  FeedState copyWith({
    List<Post>? posts,
    Map<int, List<Comment>>? commentsByPost,
    bool? isLoading,
    bool? isLoadingMore,
    bool? isSubmitting,
    int? page,
    bool? hasMore,
    String? errorMessage,
  }) {
    return FeedState(
      posts: posts ?? this.posts,
      commentsByPost: commentsByPost ?? this.commentsByPost,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        posts,
        commentsByPost,
        isLoading,
        isLoadingMore,
        isSubmitting,
        page,
        hasMore,
        errorMessage,
      ];
}
