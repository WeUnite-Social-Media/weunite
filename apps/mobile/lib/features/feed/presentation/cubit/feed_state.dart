part of 'feed_cubit.dart';

class FeedState extends Equatable {
  const FeedState({
    this.posts = const [],
    this.commentsByPost = const {},
    this.isLoading = false,
    this.isLoadingMore = false,
    this.isSubmitting = false,
    this.hasLoaded = false,
    this.page = 0,
    this.hasMore = true,
    this.loadErrorMessage,
    this.actionErrorMessage,
  });

  final List<Post> posts;
  final Map<int, List<Comment>> commentsByPost;
  final bool isLoading;
  final bool isLoadingMore;
  final bool isSubmitting;
  final bool hasLoaded;
  final int page;
  final bool hasMore;
  final String? loadErrorMessage;
  final String? actionErrorMessage;

  FeedState copyWith({
    List<Post>? posts,
    Map<int, List<Comment>>? commentsByPost,
    bool? isLoading,
    bool? isLoadingMore,
    bool? isSubmitting,
    bool? hasLoaded,
    int? page,
    bool? hasMore,
    ValueGetter<String?>? loadErrorMessage,
    ValueGetter<String?>? actionErrorMessage,
  }) {
    return FeedState(
      posts: posts ?? this.posts,
      commentsByPost: commentsByPost ?? this.commentsByPost,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      hasLoaded: hasLoaded ?? this.hasLoaded,
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      loadErrorMessage:
          loadErrorMessage != null ? loadErrorMessage() : this.loadErrorMessage,
      actionErrorMessage: actionErrorMessage != null
          ? actionErrorMessage()
          : this.actionErrorMessage,
    );
  }

  @override
  List<Object?> get props => [
        posts,
        commentsByPost,
        isLoading,
        isLoadingMore,
        isSubmitting,
        hasLoaded,
        page,
        hasMore,
        loadErrorMessage,
        actionErrorMessage,
      ];
}
