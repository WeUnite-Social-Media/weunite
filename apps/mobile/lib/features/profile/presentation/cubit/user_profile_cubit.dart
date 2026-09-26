import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../../chat/domain/repositories/chat_repository.dart';
import '../../domain/entities/profile.dart';
import '../../domain/repositories/profile_repository.dart';

part 'user_profile_state.dart';

/// Loads a third party's [Profile] for the `/profile/:userId` route and owns
/// the two actions the web header offers there: follow/unfollow and "Conversar".
/// Kept separate from [ProfileCubit], which only ever holds the signed-in
/// user's own profile.
class UserProfileCubit extends Cubit<UserProfileState> {
  UserProfileCubit({
    required this.userId,
    required ProfileRepository repository,
    ChatRepository? chatRepository,
  })  : _repository = repository,
        _chatRepository = chatRepository,
        super(const UserProfileState());

  final int userId;
  final ProfileRepository _repository;
  final ChatRepository? _chatRepository;

  Future<void> load() async {
    emit(state.copyWith(isLoading: true, errorMessage: () => null));
    try {
      final profile = await _repository.getProfile(userId);
      emit(state.copyWith(isLoading: false, profile: profile));
    } on AppException catch (error) {
      emit(
        state.copyWith(isLoading: false, errorMessage: () => error.message),
      );
    }
  }

  /// Follows or unfollows, keeping the follower count in step. The API answer
  /// is the source of truth, so a rejected toggle reverts.
  Future<void> toggleFollow() async {
    final profile = state.profile;
    if (profile == null || state.isFollowPending) {
      return;
    }
    final wasFollowing = profile.isFollowing;
    emit(
      state.copyWith(
        isFollowPending: true,
        actionErrorMessage: () => null,
        profile: _applyFollow(profile, isFollowing: !wasFollowing),
      ),
    );
    try {
      final isFollowing = await _repository.toggleFollow(followedId: userId);
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          isFollowPending: false,
          profile: _applyFollow(profile, isFollowing: isFollowing),
        ),
      );
    } on AppException catch (error) {
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          isFollowPending: false,
          profile: profile,
          actionErrorMessage: () => error.message,
        ),
      );
    }
  }

  Profile _applyFollow(Profile profile, {required bool isFollowing}) {
    if (profile.isFollowing == isFollowing) {
      return profile;
    }
    final followers = profile.followersCount + (isFollowing ? 1 : -1);
    return profile.copyWith(
      isFollowing: isFollowing,
      followersCount: followers < 0 ? 0 : followers,
    );
  }

  /// Opens (or creates) the conversation with this user, like the web header's
  /// "Conversar" button. Returns the conversation id, or null when it failed.
  Future<int?> openConversation() async {
    final chatRepository = _chatRepository;
    if (chatRepository == null || state.isConversationPending) {
      return null;
    }
    emit(
      state.copyWith(
        isConversationPending: true,
        actionErrorMessage: () => null,
      ),
    );
    try {
      final conversation = await chatRepository.startConversationWith(userId);
      if (isClosed) {
        return conversation.id;
      }
      emit(state.copyWith(isConversationPending: false));
      return conversation.id;
    } on AppException catch (error) {
      if (isClosed) {
        return null;
      }
      emit(
        state.copyWith(
          isConversationPending: false,
          actionErrorMessage: () => error.message,
        ),
      );
      return null;
    }
  }

  void dismissActionError() {
    if (state.actionErrorMessage == null) {
      return;
    }
    emit(state.copyWith(actionErrorMessage: () => null));
  }
}
