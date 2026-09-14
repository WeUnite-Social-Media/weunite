part of 'chat_cubit.dart';

class ChatState extends Equatable {
  const ChatState({
    this.conversations = const [],
    this.isLoading = false,
    this.errorMessage,
  });

  final List<Conversation> conversations;
  final bool isLoading;
  final String? errorMessage;

  ChatState copyWith({
    List<Conversation>? conversations,
    bool? isLoading,
    String? errorMessage,
  }) {
    return ChatState(
      conversations: conversations ?? this.conversations,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [conversations, isLoading, errorMessage];
}
