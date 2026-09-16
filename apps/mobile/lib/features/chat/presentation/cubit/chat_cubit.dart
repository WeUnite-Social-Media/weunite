import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/conversation.dart';
import '../../domain/repositories/chat_repository.dart';

part 'chat_state.dart';

class ChatCubit extends Cubit<ChatState> {
  ChatCubit(this._repository) : super(const ChatState());

  final ChatRepository _repository;

  Future<void> loadConversations() async {
    final hadConversations = state.conversations.isNotEmpty;
    emit(
      state.copyWith(
        isLoading: !hadConversations,
        loadErrorMessage: () => null,
        actionErrorMessage: () => null,
      ),
    );
    try {
      final conversations = await _repository.getConversations();
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          conversations: conversations,
        ),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          loadErrorMessage: hadConversations ? null : () => error.message,
          actionErrorMessage: hadConversations ? () => error.message : null,
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
