import 'dart:async';

import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/chat/domain/entities/chat_realtime_event.dart';
import 'package:weunite_mobile/features/chat/domain/entities/conversation.dart';
import 'package:weunite_mobile/features/chat/domain/repositories/chat_repository.dart';
import 'package:weunite_mobile/features/chat/presentation/cubit/conversation_cubit.dart';

class _FakeChatRepository implements ChatRepository {
  _FakeChatRepository({
    List<ChatMessage> history = const [],
    this.getMessagesDelay = Duration.zero,
    this.sendMessageThrows = false,
  }) : _history = history;

  final List<ChatMessage> _history;
  final Duration getMessagesDelay;
  final bool sendMessageThrows;
  final _controller = StreamController<ChatRealtimeEvent>();
  int getMessagesCalls = 0;
  final List<String> sentContents = [];

  void emit(ChatRealtimeEvent event) => _controller.add(event);

  bool get hasListener => _controller.hasListener;

  @override
  Future<List<Conversation>> getConversations() async => const [];

  @override
  Future<Conversation> getConversation(int conversationId) async {
    throw const AppException('Nao implementado.');
  }

  @override
  Future<List<ChatMessage>> getMessages({required int conversationId}) async {
    getMessagesCalls++;
    if (getMessagesDelay > Duration.zero) {
      await Future<void>.delayed(getMessagesDelay);
    }
    return _history;
  }

  @override
  Stream<ChatRealtimeEvent> watchConversation(int conversationId) =>
      _controller.stream;

  @override
  Future<void> sendMessage({
    required int conversationId,
    required String content,
  }) async {
    if (sendMessageThrows) {
      throw const AppException('Falha ao enviar.');
    }
    sentContents.add(content);
  }

  @override
  Future<void> sendImage({
    required int conversationId,
    required String imagePath,
  }) async {}

  @override
  Future<void> markConversationAsRead(int conversationId) async {}

  @override
  Future<void> disconnectRealtime() async {}
}

ChatMessage _msg(
  int id, {
  String content = 'Oi',
  bool edited = false,
  bool deleted = false,
}) {
  return ChatMessage(
    id: id,
    conversationId: 30,
    senderId: 9,
    content: content,
    createdAt: DateTime.utc(2026, 9, 15, 12, 0, id),
    edited: edited,
    deleted: deleted,
  );
}

void main() {
  group('ConversationCubit', () {
    test(
        'does not duplicate a message received via realtime that is '
        'already in the loaded history', () async {
      final repository = _FakeChatRepository(history: [_msg(55)]);
      final cubit =
          ConversationCubit(conversationId: 30, repository: repository);

      await cubit.start();
      repository.emit(ChatMessageReceived(_msg(55)));
      await Future<void>.delayed(Duration.zero);

      expect(cubit.state.messages, hasLength(1));
      await cubit.close();
    });

    test(
        'a message received via realtime before history resolves is '
        'merged without duplicates and stays ordered', () async {
      final repository = _FakeChatRepository(
        history: [_msg(55), _msg(56)],
        getMessagesDelay: const Duration(milliseconds: 20),
      );
      final cubit =
          ConversationCubit(conversationId: 30, repository: repository);

      final startFuture = cubit.start();
      repository.emit(ChatMessageReceived(_msg(56)));
      await startFuture;

      expect(cubit.state.messages.map((m) => m.id), [55, 56]);
      await cubit.close();
    });

    test('an edited message replaces the existing one by id', () async {
      final repository = _FakeChatRepository(history: [_msg(55)]);
      final cubit =
          ConversationCubit(conversationId: 30, repository: repository);
      await cubit.start();

      repository
          .emit(ChatMessageEdited(_msg(55, content: 'Editado', edited: true)));
      await Future<void>.delayed(Duration.zero);

      expect(cubit.state.messages, hasLength(1));
      expect(cubit.state.messages.single.content, 'Editado');
      expect(cubit.state.messages.single.edited, isTrue);
      await cubit.close();
    });

    test('a deleted message is marked as deleted; unknown ids are ignored',
        () async {
      final repository = _FakeChatRepository(history: [_msg(55)]);
      final cubit =
          ConversationCubit(conversationId: 30, repository: repository);
      await cubit.start();

      repository.emit(const ChatMessageDeleted(messageId: 999));
      await Future<void>.delayed(Duration.zero);
      expect(cubit.state.messages.single.deleted, isFalse);

      repository.emit(const ChatMessageDeleted(messageId: 55));
      await Future<void>.delayed(Duration.zero);
      expect(cubit.state.messages.single.deleted, isTrue);
      await cubit.close();
    });

    test('ChatRealtimeReconnected triggers a new getMessages call', () async {
      final repository = _FakeChatRepository(history: [_msg(55)]);
      final cubit =
          ConversationCubit(conversationId: 30, repository: repository);
      await cubit.start();
      expect(repository.getMessagesCalls, 1);

      repository.emit(const ChatRealtimeReconnected());
      await Future<void>.delayed(Duration.zero);

      expect(repository.getMessagesCalls, 2);
      await cubit.close();
    });

    test('close() cancels the realtime subscription', () async {
      final repository = _FakeChatRepository(history: [_msg(55)]);
      final cubit =
          ConversationCubit(conversationId: 30, repository: repository);
      await cubit.start();
      expect(repository.hasListener, isTrue);

      await cubit.close();

      expect(repository.hasListener, isFalse);
    });

    blocTest<ConversationCubit, ConversationState>(
      'trims the content, sends it and bumps messageSentTick',
      build: () => ConversationCubit(
        conversationId: 30,
        repository: _FakeChatRepository(),
      ),
      act: (cubit) => cubit.sendMessage('  oi  '),
      expect: () => [
        isA<ConversationState>()
            .having((state) => state.isSending, 'isSending', true),
        isA<ConversationState>()
            .having((state) => state.isSending, 'isSending', false)
            .having((state) => state.messageSentTick, 'messageSentTick', 1),
      ],
    );

    test('sending a blank message does not call the repository', () async {
      final repository = _FakeChatRepository();
      final cubit =
          ConversationCubit(conversationId: 30, repository: repository);

      await cubit.sendMessage('   ');

      expect(repository.sentContents, isEmpty);
      await cubit.close();
    });

    blocTest<ConversationCubit, ConversationState>(
      'emits actionErrorMessage and isSending false when the repository '
      'call fails',
      build: () => ConversationCubit(
        conversationId: 30,
        repository: _FakeChatRepository(sendMessageThrows: true),
      ),
      act: (cubit) => cubit.sendMessage('oi'),
      expect: () => [
        isA<ConversationState>()
            .having((state) => state.isSending, 'isSending', true),
        isA<ConversationState>()
            .having((state) => state.isSending, 'isSending', false)
            .having(
              (state) => state.actionErrorMessage,
              'actionErrorMessage',
              'Falha ao enviar.',
            ),
      ],
    );
  });
}
