part of 'chat_cubit.dart';

class ChatState extends Equatable {
  const ChatState({
    this.conversations = const [],
    this.isLoading = false,
    this.hasLoaded = false,
    this.loadErrorMessage,
    this.actionErrorMessage,
  });

  final List<Conversation> conversations;
  final bool isLoading;
  final bool hasLoaded;
  final String? loadErrorMessage;
  final String? actionErrorMessage;

  ChatState copyWith({
    List<Conversation>? conversations,
    bool? isLoading,
    bool? hasLoaded,
    ValueGetter<String?>? loadErrorMessage,
    ValueGetter<String?>? actionErrorMessage,
  }) {
    return ChatState(
      conversations: conversations ?? this.conversations,
      isLoading: isLoading ?? this.isLoading,
      hasLoaded: hasLoaded ?? this.hasLoaded,
      loadErrorMessage:
          loadErrorMessage != null ? loadErrorMessage() : this.loadErrorMessage,
      actionErrorMessage: actionErrorMessage != null
          ? actionErrorMessage()
          : this.actionErrorMessage,
    );
  }

  @override
  List<Object?> get props => [
        conversations,
        isLoading,
        hasLoaded,
        loadErrorMessage,
        actionErrorMessage,
      ];
}
