import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/session/session_events.dart';
import 'package:weunite_mobile/features/auth/domain/entities/app_user.dart';
import 'package:weunite_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:weunite_mobile/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:weunite_mobile/features/chat/domain/entities/chat_realtime_event.dart';
import 'package:weunite_mobile/features/chat/domain/entities/conversation.dart';
import 'package:weunite_mobile/features/chat/domain/repositories/chat_repository.dart';
import 'package:weunite_mobile/features/chat/presentation/screens/conversation_screen.dart';
import 'package:weunite_mobile/features/chat/presentation/widgets/audio_message_player.dart';
import 'package:weunite_mobile/features/chat/presentation/widgets/voice_recorder_button.dart';

class _FakeAuthRepository implements AuthRepository {
  @override
  Future<AppUser> verifyEmail({
    required String email,
    required String verificationToken,
  }) async =>
      throw UnimplementedError();

  @override
  AppUser? currentUser;

  @override
  Future<AppUser?> restoreSession() async => currentUser;

  @override
  Future<AppUser> login({
    required String username,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<void> signUpAthlete({
    required String name,
    required String username,
    required String email,
    required String password,
  }) async {}

  @override
  Future<void> signUpCompany({
    required String name,
    required String username,
    required String email,
    required String cnpj,
  }) async {}

  @override
  Future<void> logout() async {}
}

class _FakeChatRepository implements ChatRepository {
  _FakeChatRepository({this.messages = const []});

  final List<ChatMessage> messages;
  final List<String> sentImagePaths = [];
  final List<String> sentAudioPaths = [];

  @override
  Stream<ChatRealtimeEvent> watchConversationRead(int conversationId) =>
      const Stream.empty();

  @override
  Stream<ChatRealtimeEvent> watchConversation(int conversationId) =>
      const Stream.empty();

  @override
  Future<List<ChatMessage>> getMessages({required int conversationId}) async =>
      messages;

  @override
  Future<void> markConversationAsRead(int conversationId) async {}

  @override
  Future<List<Conversation>> getConversations() async => const [];

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
  }) async {
    sentImagePaths.add(imagePath);
  }

  @override
  Future<void> sendAudio({
    required int conversationId,
    required String audioPath,
  }) async {
    sentAudioPaths.add(audioPath);
  }

  @override
  Future<void> disconnectRealtime() async {}
}

const _viewer = AppUser(
  id: 1,
  name: 'Alice',
  username: 'alice',
  email: 'alice@weunite.com',
  role: 'ATHLETE',
);

ChatMessage _message({
  required int id,
  required String content,
  ChatMessageType type = ChatMessageType.text,
}) {
  return ChatMessage(
    id: id,
    conversationId: 30,
    senderId: 2,
    content: content,
    type: type,
    createdAt: DateTime.utc(2026, 9, 26, 10, id),
  );
}

Future<void> _pump(
  WidgetTester tester, {
  required List<ChatMessage> messages,
}) async {
  await tester.binding.setSurfaceSize(const Size(360, 690));
  addTearDown(() => tester.binding.setSurfaceSize(null));

  final authRepository = _FakeAuthRepository()..currentUser = _viewer;
  final authCubit = AuthCubit(authRepository, SessionEvents())
    ..restoreSession();
  addTearDown(authCubit.close);

  await tester.pumpWidget(
    MaterialApp(
      home: MultiRepositoryProvider(
        providers: [
          RepositoryProvider<ChatRepository>.value(
            value: _FakeChatRepository(messages: messages),
          ),
        ],
        child: BlocProvider.value(
          value: authCubit,
          child: ConversationScreen(
            conversation: const Conversation(id: 30, peerUserId: 2),
          ),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  group('ConversationScreen message bubble', () {
    testWidgets('renders plain text content as text', (tester) async {
      await _pump(
        tester,
        messages: [_message(id: 1, content: 'Ola, tudo bem?')],
      );

      expect(find.text('Ola, tudo bem?'), findsOneWidget);
      expect(find.byType(AudioMessagePlayer), findsNothing);
      expect(find.byType(Image), findsNothing);
    });

    testWidgets('renders an image URL as an image, not text', (tester) async {
      await _pump(
        tester,
        messages: [
          _message(
            id: 1,
            content: 'https://cdn.weunite.com/chat/photo.jpg',
            type: ChatMessageType.image,
          ),
        ],
      );

      expect(find.byType(Image), findsOneWidget);
      expect(find.text('https://cdn.weunite.com/chat/photo.jpg'), findsNothing);
      expect(find.byType(AudioMessagePlayer), findsNothing);
    });

    testWidgets(
        'renders an audio URL with the audio player, detected from the '
        'content itself even though message.type is a plain FILE (the '
        'backend has no AUDIO type)', (tester) async {
      await _pump(
        tester,
        messages: [
          _message(
            id: 1,
            content: 'https://cdn.weunite.com/chat/voice.m4a',
            type: ChatMessageType.file,
          ),
        ],
      );

      expect(find.byType(AudioMessagePlayer), findsOneWidget);
      expect(
        find.text('https://cdn.weunite.com/chat/voice.m4a'),
        findsNothing,
      );
      expect(find.byType(Image), findsNothing);
    });

    testWidgets('history loaded from REST also resolves audio URLs',
        (tester) async {
      // Regression: the bubble must recognize audio coming from the
      // conversation's REST history (GET .../messages/{userId}), not only
      // from a realtime event just sent in this session.
      await _pump(
        tester,
        messages: [
          _message(id: 1, content: 'Oi'),
          _message(
            id: 2,
            content: 'https://cdn.weunite.com/chat/old-voice.mp3',
            type: ChatMessageType.file,
          ),
        ],
      );

      expect(find.byType(AudioMessagePlayer), findsOneWidget);
      expect(find.text('Oi'), findsOneWidget);
    });
  });

  group('ConversationScreen composer', () {
    testWidgets(
        'shows the mic button (voice recorder) when the field is '
        'empty', (tester) async {
      await _pump(tester, messages: const []);

      expect(find.byType(VoiceRecorderButton), findsOneWidget);
      expect(find.byIcon(Icons.send), findsNothing);
    });

    testWidgets('typing text swaps the mic button for the send button',
        (tester) async {
      await _pump(tester, messages: const []);

      await tester.enterText(find.byType(TextField), 'Ola');
      await tester.pump();

      expect(find.byType(VoiceRecorderButton), findsNothing);
      expect(find.byIcon(Icons.send), findsOneWidget);
    });

    testWidgets(
        'clearing the text field back to empty restores the mic '
        'button', (tester) async {
      await _pump(tester, messages: const []);

      await tester.enterText(find.byType(TextField), 'Ola');
      await tester.pump();
      await tester.enterText(find.byType(TextField), '');
      await tester.pump();

      expect(find.byType(VoiceRecorderButton), findsOneWidget);
    });
  });
}
