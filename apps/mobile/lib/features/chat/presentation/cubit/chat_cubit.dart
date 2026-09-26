import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/chat_realtime_event.dart';
import '../../domain/entities/conversation.dart';
import '../../domain/repositories/chat_repository.dart';

part 'chat_state.dart';

/// Conversation list. Besides loading it, the cubit subscribes to every
/// conversation topic so preview, time, unread badge and ordering update as
/// messages arrive — no pull-to-refresh needed.
class ChatCubit extends Cubit<ChatState> {
  ChatCubit(this._repository, {this.currentUserId}) : super(const ChatState());

  final ChatRepository _repository;

  /// Signed-in user id, used only to tell whether an incoming message is
  /// from the peer (and should raise the unread badge).
  final int? currentUserId;
  final _subscriptions = <int, StreamSubscription<ChatRealtimeEvent>>{};

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
          conversations: _sorted(conversations),
        ),
      );
      _syncSubscriptions(conversations);
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

  /// Clears the unread badge locally once the conversation was opened; the
  /// API side is updated by `ConversationCubit`.
  void markAsRead(int conversationId) {
    final conversations = [
      for (final conversation in state.conversations)
        if (conversation.id == conversationId)
          conversation.copyWith(unreadCount: 0)
        else
          conversation,
    ];
    emit(state.copyWith(conversations: conversations));
  }

  void _syncSubscriptions(List<Conversation> conversations) {
    final ids = conversations.map((conversation) => conversation.id).toSet();
    for (final id in _subscriptions.keys.toList()) {
      if (!ids.contains(id)) {
        unawaited(_subscriptions.remove(id)?.cancel());
      }
    }
    for (final id in ids) {
      _subscriptions.putIfAbsent(
        id,
        () => _repository
            .watchConversation(id)
            .listen((event) => _onRealtimeEvent(id, event)),
      );
    }
  }

  void _onRealtimeEvent(int conversationId, ChatRealtimeEvent event) {
    if (event is! ChatMessageReceived) {
      return;
    }
    final message = event.message;
    final fromPeer = message.senderId != currentUserId;
    final updated = [
      for (final conversation in state.conversations)
        if (conversation.id == conversationId)
          conversation.copyWith(
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            lastMessageType: message.type,
            unreadCount: fromPeer
                ? conversation.unreadCount + 1
                : conversation.unreadCount,
          )
        else
          conversation,
    ];
    emit(state.copyWith(conversations: _sorted(updated)));
  }

  /// Newest conversation first; ones without messages go last.
  List<Conversation> _sorted(List<Conversation> conversations) {
    return [...conversations]..sort((a, b) {
        final aAt = a.lastMessageAt;
        final bAt = b.lastMessageAt;
        if (aAt == null && bAt == null) {
          return b.id.compareTo(a.id);
        }
        if (aAt == null) {
          return 1;
        }
        if (bAt == null) {
          return -1;
        }
        return bAt.compareTo(aAt);
      });
  }

  void dismissActionError() {
    if (state.actionErrorMessage == null) {
      return;
    }
    emit(state.copyWith(actionErrorMessage: () => null));
  }

  @override
  Future<void> close() async {
    for (final subscription in _subscriptions.values) {
      await subscription.cancel();
    }
    _subscriptions.clear();
    return super.close();
  }
}
