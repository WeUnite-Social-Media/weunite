part of 'user_search_cubit.dart';

class UserSearchState extends Equatable {
  const UserSearchState({
    this.query = '',
    this.isLoading = false,
    this.hasSearched = false,
    this.users = const [],
    this.pendingUserId,
    this.errorMessage,
  });

  final String query;
  final bool isLoading;

  /// True once a search for the current query has finished, so the screen can
  /// tell "nothing typed yet" from "nothing found".
  final bool hasSearched;
  final List<Profile> users;

  /// User whose conversation is being opened right now.
  final int? pendingUserId;
  final String? errorMessage;

  bool get isEmpty => users.isEmpty;

  UserSearchState copyWith({
    String? query,
    bool? isLoading,
    bool? hasSearched,
    List<Profile>? users,
    ValueGetter<int?>? pendingUserId,
    ValueGetter<String?>? errorMessage,
  }) {
    return UserSearchState(
      query: query ?? this.query,
      isLoading: isLoading ?? this.isLoading,
      hasSearched: hasSearched ?? this.hasSearched,
      users: users ?? this.users,
      pendingUserId:
          pendingUserId != null ? pendingUserId() : this.pendingUserId,
      errorMessage: errorMessage != null ? errorMessage() : this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        query,
        isLoading,
        hasSearched,
        users,
        pendingUserId,
        errorMessage,
      ];
}
