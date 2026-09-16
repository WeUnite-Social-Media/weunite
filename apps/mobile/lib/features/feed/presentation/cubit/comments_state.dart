part of 'comments_cubit.dart';

class CommentsState extends Equatable {
  const CommentsState({
    this.comments = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.isSubmitting = false,
    this.hasLoaded = false,
    this.page = 0,
    this.hasMore = true,
    this.loadErrorMessage,
    this.actionErrorMessage,
    this.commentCreatedTick = 0,
  });

  final List<Comment> comments;
  final bool isLoading;
  final bool isLoadingMore;
  final bool isSubmitting;
  final bool hasLoaded;
  final int page;
  final bool hasMore;
  final String? loadErrorMessage;
  final String? actionErrorMessage;

  /// Bumped every time a comment is created successfully so listeners can
  /// react once per creation without depending on list contents.
  final int commentCreatedTick;

  CommentsState copyWith({
    List<Comment>? comments,
    bool? isLoading,
    bool? isLoadingMore,
    bool? isSubmitting,
    bool? hasLoaded,
    int? page,
    bool? hasMore,
    ValueGetter<String?>? loadErrorMessage,
    ValueGetter<String?>? actionErrorMessage,
    int? commentCreatedTick,
  }) {
    return CommentsState(
      comments: comments ?? this.comments,
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
      commentCreatedTick: commentCreatedTick ?? this.commentCreatedTick,
    );
  }

  @override
  List<Object?> get props => [
        comments,
        isLoading,
        isLoadingMore,
        isSubmitting,
        hasLoaded,
        page,
        hasMore,
        loadErrorMessage,
        actionErrorMessage,
        commentCreatedTick,
      ];
}
