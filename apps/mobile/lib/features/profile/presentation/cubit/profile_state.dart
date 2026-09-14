part of 'profile_cubit.dart';

class ProfileState extends Equatable {
  const ProfileState({
    this.profile,
    this.isLoading = false,
    this.errorMessage,
  });

  final Profile? profile;
  final bool isLoading;
  final String? errorMessage;

  ProfileState copyWith({
    Profile? profile,
    bool? isLoading,
    String? errorMessage,
  }) {
    return ProfileState(
      profile: profile ?? this.profile,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [profile, isLoading, errorMessage];
}
