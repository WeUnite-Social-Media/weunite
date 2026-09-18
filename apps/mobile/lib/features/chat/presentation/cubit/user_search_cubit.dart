import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/session/current_user_provider.dart';
import '../../../profile/domain/entities/profile.dart';
import '../../../profile/domain/repositories/profile_repository.dart';
import '../../../search/presentation/cubit/search_cubit.dart'
    show kSearchDebounce;
import '../../domain/repositories/chat_repository.dart';

part 'user_search_state.dart';

/// Chat-only people search: it looks up users and opens (or creates) the 1:1
/// conversation with whoever is tapped. It never opens a profile — that is what
/// the Home search (`SearchCubit`) is for.
class UserSearchCubit extends Cubit<UserSearchState> {
  UserSearchCubit({
    required ProfileRepository profileRepository,
    required ChatRepository chatRepository,
    CurrentUserProvider? currentUserProvider,
  })  : _profileRepository = profileRepository,
        _chatRepository = chatRepository,
        _currentUserProvider = currentUserProvider,
        super(const UserSearchState());

  final ProfileRepository _profileRepository;
  final ChatRepository _chatRepository;

  /// Only used to drop myself from the results — there is no conversation with
  /// yourself.
  final CurrentUserProvider? _currentUserProvider;

  Timer? _debounce;

  /// Called on every keystroke; the request only runs after [kSearchDebounce].
  void queryChanged(String query) {
    final trimmed = query.trim();
    _debounce?.cancel();

    if (trimmed.isEmpty) {
      emit(const UserSearchState());
      return;
    }

    emit(
      state.copyWith(
        query: trimmed,
        isLoading: true,
        errorMessage: () => null,
      ),
    );
    _debounce = Timer(kSearchDebounce, () => search(trimmed));
  }

  Future<void> search(String query) async {
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      return;
    }
    emit(
      state.copyWith(
        query: trimmed,
        isLoading: true,
        errorMessage: () => null,
      ),
    );
    try {
      final users = await _profileRepository.searchUsers(trimmed);
      if (isClosed || state.query != trimmed) {
        return;
      }
      final myId = _currentUserProvider?.currentUserId;
      emit(
        state.copyWith(
          isLoading: false,
          hasSearched: true,
          users: users.where((user) => user.id != myId).toList(),
        ),
      );
    } on AppException catch (error) {
      if (isClosed || state.query != trimmed) {
        return;
      }
      emit(
        state.copyWith(
          isLoading: false,
          hasSearched: true,
          errorMessage: () => error.message,
        ),
      );
    }
  }

  /// Opens the conversation with [userId], creating it when there is none.
  /// Returns the conversation id, or null when it failed (the error is in the
  /// state). [pendingUserId] keeps a second tap from starting it twice.
  Future<int?> openConversationWith(int userId) async {
    if (state.pendingUserId != null) {
      return null;
    }
    emit(
      state.copyWith(
        pendingUserId: () => userId,
        errorMessage: () => null,
      ),
    );
    try {
      final conversation = await _chatRepository.startConversationWith(userId);
      if (isClosed) {
        return conversation.id;
      }
      emit(state.copyWith(pendingUserId: () => null));
      return conversation.id;
    } on AppException catch (error) {
      if (isClosed) {
        return null;
      }
      emit(
        state.copyWith(
          pendingUserId: () => null,
          errorMessage: () => error.message,
        ),
      );
      return null;
    }
  }

  void dismissError() {
    if (state.errorMessage == null) {
      return;
    }
    emit(state.copyWith(errorMessage: () => null));
  }

  @override
  Future<void> close() {
    _debounce?.cancel();
    return super.close();
  }
}
