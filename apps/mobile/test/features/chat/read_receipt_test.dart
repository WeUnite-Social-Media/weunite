import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/chat/domain/entities/chat_realtime_event.dart';
import 'package:weunite_mobile/features/chat/domain/entities/conversation.dart';
import 'package:weunite_mobile/features/chat/domain/repositories/chat_repository.dart';
import 'package:weunite_mobile/features/chat/presentation/cubit/chat_cubit.dart';
import 'package:weunite_mobile/features/chat/presentation/cubit/conversation_cubit.dart';

ChatMessage _message({
  required int id,
  required int senderId,
  bool read = false,
}) {
  return ChatMessage(
    id: id,
    conversationId: 1,
    senderId: senderId,
    content: 'Ola',
    read: read,
    createdAt: DateTime.utc(2026, 9, 18, 12),
  );
}

class _FakeChatRepository implements ChatRepository {
  final readController = StreamController<ChatRealtimeEvent>.broadcast();
  List<ChatMessage> messages = [];
  List<Conversation> conversations = [];
  final readCalls = <int>[];

  @override
  Stream<ChatRealtimeEvent> watchConversationRead(int conversationId) =>
      readController.stream;

  @override
  Stream<ChatRealtimeEvent> watchConversation(int conversationId) =>
      const Stream.empty();

  @override
  Future<List<ChatMessage>> getMessages({required int conversationId}) async =>
      messages;

  @override
  Future<void> markConversationAsRead(int conversationId) async {
    readCalls.add(conversationId);
  }

  @override
  Future<List<Conversation>> getConversations() async => conversations;

  @override
  Future<Conversation> getConversation(int conversationId) async =>
      Conversation(id: conversationId, peerUserId: 2);

  @override
  Future<Conversation> startConversationWith(int userId) async =>
      Conversation(id: 9, peerUserId: userId);

  @override
  Future<void> sendMessage({
    required int conversationId,
    required String content,
  }) async {}

  @override
  Future<void> sendImage({
    required int conversationId,
    required String imagePath,
  }) async {}

  @override
  Future<void> disconnectRealtime() async {}
}

void main() {
  group('ConversationCubit read receipts', () {
    test('marks my messages as read when the peer reads the conversation',
        () async {
      final repository = _FakeChatRepository()
        ..messages = [
          _message(id: 1, senderId: 1),
          _message(id: 2, senderId: 2),
        ];
      final cubit =
          ConversationCubit(conversationId: 1, repository: repository);
      await cubit.start();

      // The API broadcasts only the reader's id on
      // /topic/conversation/{id}/read.
      repository.readController.add(
        const ChatConversationRead(readerUserId: 2),
      );
      await pumpEventQueue();

      final byId = {
        for (final message in cubit.state.messages) message.id: message.read,
      };
      expect(byId[1], isTrue, reason: 'my message was seen');
      expect(byId[2], isFalse, reason: 'the reader own message is untouched');
      await cubit.close();
    });
  });

  group('ChatState.totalUnreadCount', () {
    test('sums the unread counter of every conversation', () {
      const state = ChatState(
        conversations: [
          Conversation(id: 1, peerUserId: 2, unreadCount: 3),
          Conversation(id: 2, peerUserId: 3, unreadCount: 2),
          Conversation(id: 3, peerUserId: 4),
        ],
      );

      expect(state.totalUnreadCount, 5);
    });

    test('is zero with no conversations', () {
      expect(const ChatState().totalUnreadCount, 0);
    });
  });
}
