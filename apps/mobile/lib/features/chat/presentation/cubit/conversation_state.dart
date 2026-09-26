part of 'conversation_cubit.dart';

class ConversationState extends Equatable {
  const ConversationState({
    this.messages = const [],
    this.isLoading = false,
    this.hasLoaded = false,
    this.isSending = false,
    this.messageSentTick = 0,
    this.readTick = 0,
    this.loadErrorMessage,
    this.actionErrorMessage,
  });

  final List<ChatMessage> messages;
  final bool isLoading;
  final bool hasLoaded;
  final bool isSending;
  final int messageSentTick;

  /// Bumped every time the conversation is marked as read on the API, so the
  /// screen can tell the conversation list to clear the badge.
  final int readTick;
  final String? loadErrorMessage;
  final String? actionErrorMessage;

  ConversationState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    bool? hasLoaded,
    bool? isSending,
    int? messageSentTick,
    int? readTick,
    ValueGetter<String?>? loadErrorMessage,
    ValueGetter<String?>? actionErrorMessage,
  }) {
    return ConversationState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      hasLoaded: hasLoaded ?? this.hasLoaded,
      isSending: isSending ?? this.isSending,
      messageSentTick: messageSentTick ?? this.messageSentTick,
      readTick: readTick ?? this.readTick,
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
        readTick,
        loadErrorMessage,
        actionErrorMessage,
      ];
}
