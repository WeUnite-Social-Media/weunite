import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/profile.dart';
import '../../domain/repositories/profile_repository.dart';

part 'profile_state.dart';

class ProfileCubit extends Cubit<ProfileState> {
  ProfileCubit(this._repository) : super(const ProfileState());

  final ProfileRepository _repository;

  Future<void> loadProfile(int userId) async {
    final hadProfile = state.profile != null;
    emit(
      state.copyWith(
        isLoading: !hadProfile,
        loadErrorMessage: () => null,
        actionErrorMessage: () => null,
      ),
    );
    try {
      final profile = await _repository.getProfileById(userId);
      emit(
        state.copyWith(isLoading: false, hasLoaded: true, profile: profile),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          loadErrorMessage: hadProfile ? null : () => error.message,
          actionErrorMessage: hadProfile ? () => error.message : null,
        ),
      );
    }
  }

  void dismissActionError() {
    if (state.actionErrorMessage == null) {
      return;
    }
    emit(state.copyWith(actionErrorMessage: () => null));
  }
}
