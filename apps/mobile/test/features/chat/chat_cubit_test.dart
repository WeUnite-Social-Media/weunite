import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/chat/domain/entities/chat_realtime_event.dart';
import 'package:weunite_mobile/features/chat/domain/entities/conversation.dart';
import 'package:weunite_mobile/features/chat/domain/repositories/chat_repository.dart';
import 'package:weunite_mobile/features/chat/presentation/cubit/chat_cubit.dart';
import 'package:weunite_mobile/features/chat/presentation/screens/conversations_screen.dart';

Conversation _conversation(
  int id, {
  String? lastMessage,
  DateTime? lastMessageAt,
  int unread = 0,
}) {
  return Conversation(
    id: id,
    peerUserId: id + 100,
    peerName: 'Peer $id',
    peerUsername: 'peer$id',
    lastMessage: lastMessage,
    lastMessageAt: lastMessageAt,
    unreadCount: unread,
  );
}

ChatMessage _message({
  required int conversationId,
  required int senderId,
  String content = 'Ola',
  ChatMessageType type = ChatMessageType.text,
  DateTime? createdAt,
}) {
  return ChatMessage(
    id: DateTime.now().microsecondsSinceEpoch % 100000,
    conversationId: conversationId,
    senderId: senderId,
    content: content,
    type: type,
    createdAt: createdAt ?? DateTime.utc(2026, 9, 17, 12),
  );
}

class _FakeChatRepository implements ChatRepository {
  List<Conversation> conversations = [];
  final topics = <int, StreamController<ChatRealtimeEvent>>{};
  final readCalls = <int>[];

  StreamController<ChatRealtimeEvent> topic(int id) =>
      topics.putIfAbsent(id, StreamController<ChatRealtimeEvent>.broadcast);

  @override
  Future<List<Conversation>> getConversations() async => conversations;

  @override
  Stream<ChatRealtimeEvent> watchConversation(int conversationId) =>
      topic(conversationId).stream;

  @override
  Future<void> markConversationAsRead(int conversationId) async {
    readCalls.add(conversationId);
  }

  final startedWith = <int>[];

  @override
  Future<Conversation> startConversationWith(int userId) async {
    startedWith.add(userId);
    return _conversation(90 + userId);
  }

  @override
  Future<Conversation> getConversation(int conversationId) async =>
      _conversation(conversationId);

  @override
  Future<List<ChatMessage>> getMessages({required int conversationId}) async =>
      const [];

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
  group('ChatCubit', () {
    test('sorts conversations by the last message, newest first', () async {
      final repository = _FakeChatRepository()
        ..conversations = [
          _conversation(1, lastMessageAt: DateTime.utc(2026, 9, 17, 8)),
          _conversation(2, lastMessageAt: DateTime.utc(2026, 9, 17, 10)),
          _conversation(3),
        ];
      final cubit = ChatCubit(repository, currentUserId: 1);

      await cubit.loadConversations();

      expect(cubit.state.conversations.map((c) => c.id), [2, 1, 3]);
      await cubit.close();
    });

    test('updates preview, time and unread badge when a message arrives',
        () async {
      final repository = _FakeChatRepository()
        ..conversations = [
          _conversation(1, lastMessageAt: DateTime.utc(2026, 9, 17, 8)),
          _conversation(2, lastMessageAt: DateTime.utc(2026, 9, 17, 10)),
        ];
      final cubit = ChatCubit(repository, currentUserId: 1);
      await cubit.loadConversations();

      repository.topic(1).add(
            ChatMessageReceived(
              _message(
                conversationId: 1,
                senderId: 99,
                content: 'Oi 👋',
                createdAt: DateTime.utc(2026, 9, 17, 11),
              ),
            ),
          );
      await pumpEventQueue();

      final first = cubit.state.conversations.first;
      expect(first.id, 1, reason: 'the updated conversation moves to the top');
      expect(first.lastMessage, 'Oi 👋');
      expect(first.unreadCount, 1);
      expect(first.lastMessageAt, DateTime.utc(2026, 9, 17, 11));
      await cubit.close();
    });

    test('does not raise the badge for my own message', () async {
      final repository = _FakeChatRepository()
        ..conversations = [_conversation(1)];
      final cubit = ChatCubit(repository, currentUserId: 7);
      await cubit.loadConversations();

      repository
          .topic(1)
          .add(ChatMessageReceived(_message(conversationId: 1, senderId: 7)));
      await pumpEventQueue();

      expect(cubit.state.conversations.single.unreadCount, 0);
      await cubit.close();
    });

    test('an image message previews as "Imagem"', () async {
      final repository = _FakeChatRepository()
        ..conversations = [_conversation(1)];
      final cubit = ChatCubit(repository, currentUserId: 1);
      await cubit.loadConversations();

      repository.topic(1).add(
            ChatMessageReceived(
              _message(
                conversationId: 1,
                senderId: 99,
                content: 'https://cdn/foto.jpg',
                type: ChatMessageType.image,
              ),
            ),
          );
      await pumpEventQueue();

      expect(
        cubit.state.conversations.single.lastMessageType,
        ChatMessageType.image,
      );
      await cubit.close();
    });

    test('markAsRead clears the badge of that conversation only', () async {
      final repository = _FakeChatRepository()
        ..conversations = [
          _conversation(1, unread: 3),
          _conversation(2, unread: 2),
        ];
      final cubit = ChatCubit(repository, currentUserId: 1);
      await cubit.loadConversations();

      cubit.markAsRead(1);

      final byId = {
        for (final conversation in cubit.state.conversations)
          conversation.id: conversation.unreadCount,
      };
      expect(byId, {1: 0, 2: 2});
      await cubit.close();
    });
  });

  group('formatConversationTime', () {
    final now = DateTime(2026, 9, 17, 15);

    test('shows the time for today', () {
      expect(
        formatConversationTime(DateTime(2026, 9, 17, 9, 5), now: now),
        '09:05',
      );
    });

    test('shows day/month earlier this year', () {
      expect(formatConversationTime(DateTime(2026, 8, 30), now: now), '30/08');
    });

    test('shows the full date for other years', () {
      expect(
        formatConversationTime(DateTime(2025, 8, 30), now: now),
        '30/08/2025',
      );
    });

    test('is empty without a message', () {
      expect(formatConversationTime(null, now: now), '');
    });
  });
}
