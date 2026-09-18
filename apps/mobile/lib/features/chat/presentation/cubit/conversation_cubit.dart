import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/chat_realtime_event.dart';
import '../../domain/entities/conversation.dart';
import '../../domain/repositories/chat_repository.dart';

part 'conversation_state.dart';

class ConversationCubit extends Cubit<ConversationState> {
  ConversationCubit({
    required this.conversationId,
    required ChatRepository repository,
  })  : _repository = repository,
        super(const ConversationState());

  final int conversationId;
  final ChatRepository _repository;
  StreamSubscription<ChatRealtimeEvent>? _subscription;
  StreamSubscription<ChatRealtimeEvent>? _readSubscription;

  Future<void> start() async {
    if (_subscription != null) {
      return;
    }
    _subscription = _repository.watchConversation(conversationId).listen(
          _onEvent,
          onError: (Object _) {},
        );
    // Read receipts from the other side, so my ticks turn green live.
    _readSubscription =
        _repository.watchConversationRead(conversationId).listen(
              _onEvent,
              onError: (Object _) {},
            );
    await loadMessages();
    await markAsRead();
  }

  /// Marks the peer's messages as read on the API. Failing to do so must not
  /// break the conversation, so the error is swallowed.
  Future<void> markAsRead() async {
    try {
      await _repository.markConversationAsRead(conversationId);
      if (!isClosed) {
        emit(state.copyWith(readTick: state.readTick + 1));
      }
    } on AppException catch (_) {
      // Ignored on purpose: read receipts are best-effort.
    }
  }

  /// Uploads [imagePath] and sends it as an image message.
  Future<void> sendImage(String imagePath) async {
    if (state.isSending) {
      return;
    }
    emit(state.copyWith(isSending: true, actionErrorMessage: () => null));
    try {
      await _repository.sendImage(
        conversationId: conversationId,
        imagePath: imagePath,
      );
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          isSending: false,
          messageSentTick: state.messageSentTick + 1,
        ),
      );
    } on AppException catch (error) {
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          isSending: false,
          actionErrorMessage: () => error.message,
        ),
      );
    }
  }

  Future<void> loadMessages() async {
    final hadMessages = state.messages.isNotEmpty;
    emit(
      state.copyWith(
        isLoading: !hadMessages,
        loadErrorMessage: () => null,
      ),
    );
    try {
      final messages =
          await _repository.getMessages(conversationId: conversationId);
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          messages: _merge(state.messages, messages),
        ),
      );
    } on AppException catch (error) {
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          loadErrorMessage: hadMessages ? null : () => error.message,
          actionErrorMessage: hadMessages ? () => error.message : null,
        ),
      );
    }
  }

  Future<void> sendMessage(String content) async {
    final text = content.trim();
    if (text.isEmpty || state.isSending) {
      return;
    }
    emit(state.copyWith(isSending: true, actionErrorMessage: () => null));
    try {
      await _repository.sendMessage(
        conversationId: conversationId,
        content: text,
      );
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          isSending: false,
          messageSentTick: state.messageSentTick + 1,
        ),
      );
    } on AppException catch (error) {
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          isSending: false,
          actionErrorMessage: () => error.message,
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

  void _onEvent(ChatRealtimeEvent event) {
    if (isClosed) {
      return;
    }
    switch (event) {
      case ChatMessageReceived():
        emit(state.copyWith(messages: _merge(state.messages, [event.message])));
        // The conversation is on screen, so anything that arrives has been
        // seen: keep the API (and the list badge) in sync.
        unawaited(markAsRead());
      case ChatMessageEdited():
        emit(state.copyWith(messages: _merge(state.messages, [event.message])));
      case ChatMessageDeleted():
        final exists = state.messages.any((m) => m.id == event.messageId);
        if (!exists) {
          return;
        }
        emit(
          state.copyWith(
            messages: [
              for (final message in state.messages)
                if (message.id == event.messageId)
                  message.copyWith(deleted: true)
                else
                  message,
            ],
          ),
        );
      case ChatConversationRead(:final readerUserId):
        // The reader read everyone else's messages in this conversation —
        // the same rule the API applies (sender != reader, isRead = false).
        emit(
          state.copyWith(
            messages: [
              for (final message in state.messages)
                message.senderId == readerUserId || message.read
                    ? message
                    : message.copyWith(read: true),
            ],
          ),
        );
      case ChatRealtimeReconnected():
        unawaited(loadMessages());
    }
  }

  static List<ChatMessage> _merge(
    List<ChatMessage> current,
    List<ChatMessage> incoming,
  ) {
    final byId = <int, ChatMessage>{};
    for (final message in current) {
      byId[message.id] = message;
    }
    for (final message in incoming) {
      byId[message.id] = message;
    }
    final merged = byId.values.toList()
      ..sort((a, b) {
        final byDate = a.createdAt.compareTo(b.createdAt);
        return byDate != 0 ? byDate : a.id.compareTo(b.id);
      });
    return merged;
  }

  @override
  Future<void> close() async {
    await _readSubscription?.cancel();
    await _subscription?.cancel();
    return super.close();
  }
}
