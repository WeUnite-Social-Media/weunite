part of 'user_profile_cubit.dart';

class UserProfileState extends Equatable {
  const UserProfileState({
    this.isLoading = true,
    this.profile,
    this.errorMessage,
    this.isFollowPending = false,
    this.isConversationPending = false,
    this.actionErrorMessage,
    this.mutualFollowers = const MutualFollowers(),
  });

  final bool isLoading;
  final Profile? profile;
  final String? errorMessage;

  /// A follow/unfollow request is in flight (blocks double taps).
  final bool isFollowPending;

  /// Opening the conversation with this user is in flight.
  final bool isConversationPending;

  /// Failure of an action (follow, open chat), shown as a SnackBar — unlike
  /// [errorMessage], which replaces the whole screen.
  final String? actionErrorMessage;

  /// "Seguido por ...": people I follow who also follow this profile.
  final MutualFollowers mutualFollowers;

  UserProfileState copyWith({
    bool? isLoading,
    Profile? profile,
    ValueGetter<String?>? errorMessage,
    bool? isFollowPending,
    bool? isConversationPending,
    ValueGetter<String?>? actionErrorMessage,
    MutualFollowers? mutualFollowers,
  }) {
    return UserProfileState(
      isLoading: isLoading ?? this.isLoading,
      profile: profile ?? this.profile,
      errorMessage: errorMessage != null ? errorMessage() : this.errorMessage,
      isFollowPending: isFollowPending ?? this.isFollowPending,
      isConversationPending:
          isConversationPending ?? this.isConversationPending,
      actionErrorMessage: actionErrorMessage != null
          ? actionErrorMessage()
          : this.actionErrorMessage,
      mutualFollowers: mutualFollowers ?? this.mutualFollowers,
    );
  }

  @override
  List<Object?> get props => [
        isLoading,
        profile,
        errorMessage,
        isFollowPending,
        isConversationPending,
        actionErrorMessage,
        mutualFollowers,
      ];
}
