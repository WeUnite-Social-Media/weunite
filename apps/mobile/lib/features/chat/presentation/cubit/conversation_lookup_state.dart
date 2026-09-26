part of 'conversation_lookup_cubit.dart';

class ConversationLookupState extends Equatable {
  const ConversationLookupState({
    this.isLoading = true,
    this.conversation,
    this.errorMessage,
  });

  final bool isLoading;
  final Conversation? conversation;
  final String? errorMessage;

  @override
  List<Object?> get props => [isLoading, conversation, errorMessage];
}
