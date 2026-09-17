part of 'conversation_cubit.dart';

class ConversationState extends Equatable {
  const ConversationState({
    this.messages = const [],
    this.isLoading = false,
    this.hasLoaded = false,
    this.isSending = false,
    this.messageSentTick = 0,
    this.loadErrorMessage,
    this.actionErrorMessage,
  });

  final List<ChatMessage> messages;
  final bool isLoading;
  final bool hasLoaded;
  final bool isSending;
  final int messageSentTick;
  final String? loadErrorMessage;
  final String? actionErrorMessage;

  ConversationState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    bool? hasLoaded,
    bool? isSending,
    int? messageSentTick,
    ValueGetter<String?>? loadErrorMessage,
    ValueGetter<String?>? actionErrorMessage,
  }) {
    return ConversationState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      hasLoaded: hasLoaded ?? this.hasLoaded,
      isSending: isSending ?? this.isSending,
      messageSentTick: messageSentTick ?? this.messageSentTick,
      loadErrorMessage:
          loadErrorMessage != null ? loadErrorMessage() : this.loadErrorMessage,
      actionErrorMessage: actionErrorMessage != null
          ? actionErrorMessage()
          : this.actionErrorMessage,
    );
  }

  @override
  List<Object?> get props => [
        messages,
        isLoading,
        hasLoaded,
        isSending,
        messageSentTick,
        loadErrorMessage,
        actionErrorMessage,
      ];
}
