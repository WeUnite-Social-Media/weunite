import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/conversation.dart';
import '../../domain/repositories/chat_repository.dart';

part 'conversation_lookup_state.dart';

class ConversationLookupCubit extends Cubit<ConversationLookupState> {
  ConversationLookupCubit({
    required this.conversationId,
    required ChatRepository repository,
  })  : _repository = repository,
        super(const ConversationLookupState());

  final int conversationId;
  final ChatRepository _repository;

  Future<void> load() async {
    emit(const ConversationLookupState(isLoading: true));
    try {
      final conversation = await _repository.getConversation(conversationId);
      emit(
        ConversationLookupState(isLoading: false, conversation: conversation),
      );
    } on AppException catch (error) {
      emit(
        ConversationLookupState(isLoading: false, errorMessage: error.message),
      );
    }
  }
}
