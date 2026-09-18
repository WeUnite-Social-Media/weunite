part of 'search_cubit.dart';

class SearchState extends Equatable {
  const SearchState({
    this.query = '',
    this.isLoading = false,
    this.hasSearched = false,
    this.users = const [],
    this.posts = const [],
    this.opportunities = const [],
    this.errorMessage,
  });

  final String query;
  final bool isLoading;

  /// True once a search for the current query has finished, so the screen can
  /// tell "nothing typed yet" from "nothing found".
  final bool hasSearched;
  final List<Profile> users;
  final List<Post> posts;
  final List<Opportunity> opportunities;
  final String? errorMessage;

  bool get isEmpty => users.isEmpty && posts.isEmpty && opportunities.isEmpty;

  SearchState copyWith({
    String? query,
    bool? isLoading,
    bool? hasSearched,
    List<Profile>? users,
    List<Post>? posts,
    List<Opportunity>? opportunities,
    ValueGetter<String?>? errorMessage,
  }) {
    return SearchState(
      query: query ?? this.query,
      isLoading: isLoading ?? this.isLoading,
      hasSearched: hasSearched ?? this.hasSearched,
      users: users ?? this.users,
      posts: posts ?? this.posts,
      opportunities: opportunities ?? this.opportunities,
      errorMessage: errorMessage != null ? errorMessage() : this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        query,
        isLoading,
        hasSearched,
        users,
        posts,
        opportunities,
        errorMessage,
      ];
}
