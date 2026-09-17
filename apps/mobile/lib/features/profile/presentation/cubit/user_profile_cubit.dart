import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/profile.dart';
import '../../domain/repositories/profile_repository.dart';

part 'user_profile_state.dart';

/// Loads a third party's [Profile] for the `/profile/:userId` route.
/// Kept separate from [ProfileCubit], which only ever holds the signed-in
/// user's own profile.
class UserProfileCubit extends Cubit<UserProfileState> {
  UserProfileCubit({
    required this.userId,
    required ProfileRepository repository,
  })  : _repository = repository,
        super(const UserProfileState());

  final int userId;
  final ProfileRepository _repository;

  Future<void> load() async {
    emit(const UserProfileState(isLoading: true));
    try {
      final profile = await _repository.getProfile(userId);
      emit(UserProfileState(isLoading: false, profile: profile));
    } on AppException catch (error) {
      emit(UserProfileState(isLoading: false, errorMessage: error.message));
    }
  }
}
