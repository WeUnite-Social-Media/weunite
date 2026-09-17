part of 'profile_posts_cubit.dart';

class ProfilePostsState extends Equatable {
  const ProfilePostsState({
    this.posts = const [],
    this.pendingLikes = const {},
    this.isLoading = false,
    this.isLoadingMore = false,
    this.hasLoaded = false,
    this.page = 0,
    this.hasMore = true,
    this.loadErrorMessage,
    this.actionErrorMessage,
  });

  final List<Post> posts;
  final Set<int> pendingLikes;
  final bool isLoading;
  final bool isLoadingMore;
  final bool hasLoaded;
  final int page;
  final bool hasMore;
  final String? loadErrorMessage;
  final String? actionErrorMessage;

  ProfilePostsState copyWith({
    List<Post>? posts,
    Set<int>? pendingLikes,
    bool? isLoading,
    bool? isLoadingMore,
    bool? hasLoaded,
    int? page,
    bool? hasMore,
    ValueGetter<String?>? loadErrorMessage,
    ValueGetter<String?>? actionErrorMessage,
  }) {
    return ProfilePostsState(
      posts: posts ?? this.posts,
      pendingLikes: pendingLikes ?? this.pendingLikes,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
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
        pendingLikes,
        isLoading,
        isLoadingMore,
        hasLoaded,
        page,
        hasMore,
        loadErrorMessage,
        actionErrorMessage,
      ];
}
