part of 'profile_cubit.dart';

class ProfileState extends Equatable {
  const ProfileState({
    this.profile,
    this.isLoading = false,
    this.hasLoaded = false,
    this.loadErrorMessage,
    this.actionErrorMessage,
  });

  final Profile? profile;
  final bool isLoading;
  final bool hasLoaded;
  final String? loadErrorMessage;
  final String? actionErrorMessage;

  ProfileState copyWith({
    Profile? profile,
    bool? isLoading,
    bool? hasLoaded,
    ValueGetter<String?>? loadErrorMessage,
    ValueGetter<String?>? actionErrorMessage,
  }) {
    return ProfileState(
      profile: profile ?? this.profile,
      isLoading: isLoading ?? this.isLoading,
      hasLoaded: hasLoaded ?? this.hasLoaded,
      loadErrorMessage:
          loadErrorMessage != null ? loadErrorMessage() : this.loadErrorMessage,
      actionErrorMessage: actionErrorMessage != null
          ? actionErrorMessage()
          : this.actionErrorMessage,
    );
  }

  @override
  List<Object?> get props => [
        profile,
        isLoading,
        hasLoaded,
        loadErrorMessage,
        actionErrorMessage,
      ];
}
