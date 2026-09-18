part of 'edit_profile_cubit.dart';

class EditProfileState extends Equatable {
  const EditProfileState({
    this.skills = const [],
    this.availableSkills = const [],
    this.profileImagePath,
    this.bannerImagePath,
    this.removeBanner = false,
    this.isSaving = false,
    this.savedProfile,
    this.errorMessage,
  });

  /// Skills currently selected in the form.
  final List<String> skills;

  /// Catalog offered by the API (`GET /opportunities/skills`).
  final List<String> availableSkills;
  final String? profileImagePath;
  final String? bannerImagePath;
  final bool removeBanner;
  final bool isSaving;

  /// Set once the save succeeded, so the screen can close and refresh.
  final Profile? savedProfile;
  final String? errorMessage;

  EditProfileState copyWith({
    List<String>? skills,
    List<String>? availableSkills,
    ValueGetter<String?>? profileImagePath,
    ValueGetter<String?>? bannerImagePath,
    bool? removeBanner,
    bool? isSaving,
    Profile? savedProfile,
    ValueGetter<String?>? errorMessage,
  }) {
    return EditProfileState(
      skills: skills ?? this.skills,
      availableSkills: availableSkills ?? this.availableSkills,
      profileImagePath:
          profileImagePath != null ? profileImagePath() : this.profileImagePath,
      bannerImagePath:
          bannerImagePath != null ? bannerImagePath() : this.bannerImagePath,
      removeBanner: removeBanner ?? this.removeBanner,
      isSaving: isSaving ?? this.isSaving,
      savedProfile: savedProfile ?? this.savedProfile,
      errorMessage: errorMessage != null ? errorMessage() : this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        skills,
        availableSkills,
        profileImagePath,
        bannerImagePath,
        removeBanner,
        isSaving,
        savedProfile,
        errorMessage,
      ];
}
