import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/profile.dart';
import '../../domain/repositories/profile_repository.dart';

part 'profile_state.dart';

class ProfileCubit extends Cubit<ProfileState> {
  ProfileCubit(this._repository) : super(const ProfileState());

  final ProfileRepository _repository;

  Future<void> loadProfile(int userId) async {
    emit(state.copyWith(isLoading: true, errorMessage: null));
    try {
      final profile = await _repository.getProfileById(userId);
      emit(state.copyWith(isLoading: false, profile: profile));
    } on AppException catch (error) {
      emit(state.copyWith(isLoading: false, errorMessage: error.message));
    }
  }
}
