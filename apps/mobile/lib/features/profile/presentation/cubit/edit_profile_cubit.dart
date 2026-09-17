import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/profile.dart';
import '../../domain/repositories/profile_repository.dart';

part 'edit_profile_state.dart';

/// Backs the profile form: loads the skill catalog, keeps the picked images
/// and saves everything through `PUT /user/update/{username}`.
class EditProfileCubit extends Cubit<EditProfileState> {
  EditProfileCubit({
    required Profile profile,
    required ProfileRepository repository,
  })  : _repository = repository,
        super(EditProfileState(skills: profile.skills));

  final ProfileRepository _repository;

  Future<void> loadSkills() async {
    try {
      final skills = await _repository.getAvailableSkills();
      if (!isClosed) {
        emit(state.copyWith(availableSkills: skills));
      }
    } on AppException catch (_) {
      // The catalog is a convenience: without it the user keeps the skills
      // they already have.
    }
  }

  void toggleSkill(String skill) {
    final skills = [...state.skills];
    if (!skills.remove(skill)) {
      skills.add(skill);
    }
    emit(state.copyWith(skills: skills));
  }

  void pickProfileImage(String path) {
    emit(state.copyWith(profileImagePath: () => path));
  }

  void pickBannerImage(String path) {
    emit(
      state.copyWith(
        bannerImagePath: () => path,
        removeBanner: false,
      ),
    );
  }

  void removeBanner() {
    emit(state.copyWith(bannerImagePath: () => null, removeBanner: true));
  }

  Future<void> save({
    required String name,
    required String username,
    required String bio,
    required bool isPrivate,
    double? height,
    double? weight,
    String? footDomain,
    String? position,
    DateTime? birthDate,
    required bool isAthlete,
  }) async {
    if (state.isSaving) {
      return;
    }
    emit(state.copyWith(isSaving: true, errorMessage: () => null));
    try {
      if (state.removeBanner) {
        await _repository.deleteMyBanner();
      }
      final profile = await _repository.updateMyProfile(
        name: name,
        username: username,
        bio: bio,
        isPrivate: isPrivate,
        height: isAthlete ? height : null,
        weight: isAthlete ? weight : null,
        footDomain: isAthlete ? footDomain : null,
        position: isAthlete ? position : null,
        birthDate: isAthlete ? birthDate : null,
        skills: isAthlete ? state.skills : null,
        profileImagePath: state.profileImagePath,
        bannerImagePath: state.bannerImagePath,
      );
      if (isClosed) {
        return;
      }
      emit(state.copyWith(isSaving: false, savedProfile: profile));
    } on AppException catch (error) {
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(isSaving: false, errorMessage: () => error.message),
      );
    }
  }

  void reportError(String message) {
    emit(state.copyWith(errorMessage: () => message));
  }
}
