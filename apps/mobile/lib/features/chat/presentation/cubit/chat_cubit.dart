import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/conversation.dart';
import '../../domain/repositories/chat_repository.dart';

part 'chat_state.dart';

class ChatCubit extends Cubit<ChatState> {
  ChatCubit(this._repository) : super(const ChatState());

  final ChatRepository _repository;

  Future<void> loadConversations(int userId) async {
    emit(state.copyWith(isLoading: true, errorMessage: null));
    try {
      final conversations = await _repository.getConversations(userId);
      emit(state.copyWith(isLoading: false, conversations: conversations));
    } on AppException catch (error) {
      emit(state.copyWith(isLoading: false, errorMessage: error.message));
    }
  }
}
