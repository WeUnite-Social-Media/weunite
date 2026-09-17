part of 'user_profile_cubit.dart';

class UserProfileState extends Equatable {
  const UserProfileState({
    this.isLoading = true,
    this.profile,
    this.errorMessage,
  });

  final bool isLoading;
  final Profile? profile;
  final String? errorMessage;

  @override
  List<Object?> get props => [isLoading, profile, errorMessage];
}
