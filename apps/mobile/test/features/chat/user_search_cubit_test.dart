import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/session/current_user_provider.dart';
import 'package:weunite_mobile/features/chat/domain/entities/chat_realtime_event.dart';
import 'package:weunite_mobile/features/chat/domain/entities/conversation.dart';
import 'package:weunite_mobile/features/chat/domain/repositories/chat_repository.dart';
import 'package:weunite_mobile/features/chat/presentation/cubit/user_search_cubit.dart';
import 'package:weunite_mobile/features/profile/domain/entities/profile.dart';
import 'package:weunite_mobile/features/profile/domain/repositories/profile_repository.dart';

Profile _profile(int id, {String name = 'Ana Teste'}) => Profile(
      id: id,
      name: name,
      username: 'user$id',
      role: 'ATHLETE',
    );

class _FakeProfileRepository implements ProfileRepository {
  List<Profile> results = [];
  AppException? failure;
  final queries = <String>[];

  @override
  Future<List<Profile>> searchUsers(String query) async {
    queries.add(query);
    if (failure != null) {
      throw failure!;
    }
    return results;
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _FakeChatRepository implements ChatRepository {
  final startedWith = <int>[];
  AppException? failure;
  Completer<void>? gate;

  @override
  Future<Conversation> startConversationWith(int userId) async {
    startedWith.add(userId);
    if (gate != null) {
      await gate!.future;
    }
    if (failure != null) {
      throw failure!;
    }
    return Conversation(id: 500 + userId, peerUserId: userId);
  }

  @override
  Future<List<Conversation>> getConversations() async => const [];

  @override
  Future<Conversation> getConversation(int conversationId) async =>
      Conversation(id: conversationId, peerUserId: 2);

  @override
  Future<List<ChatMessage>> getMessages({required int conversationId}) async =>
      const [];

  @override
  Stream<ChatRealtimeEvent> watchConversation(int conversationId) =>
      const Stream.empty();

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
  Future<void> markConversationAsRead(int conversationId) async {}

  @override
  Future<void> disconnectRealtime() async {}
}

class _FakeCurrentUser implements CurrentUserProvider {
  _FakeCurrentUser(this.currentUserId);

  @override
  final int? currentUserId;

  @override
  int requireUserId() => currentUserId!;
}

UserSearchCubit _cubit({
  required _FakeProfileRepository profiles,
  required _FakeChatRepository chat,
  int? myId = 1,
}) {
  return UserSearchCubit(
    profileRepository: profiles,
    chatRepository: chat,
    currentUserProvider: _FakeCurrentUser(myId),
  );
}

void main() {
  group('UserSearchCubit.search', () {
    test('keeps only other people in the results', () async {
      final profiles = _FakeProfileRepository()
        ..results = [_profile(1, name: 'Eu'), _profile(2)];
      final cubit = _cubit(profiles: profiles, chat: _FakeChatRepository());

      await cubit.search('ana');

      expect(cubit.state.users.map((user) => user.id), [2]);
      expect(cubit.state.hasSearched, isTrue);
      await cubit.close();
    });

    test('an empty query resets the state without calling the API', () async {
      final profiles = _FakeProfileRepository()..results = [_profile(2)];
      final cubit = _cubit(profiles: profiles, chat: _FakeChatRepository());
      await cubit.search('ana');

      cubit.queryChanged('   ');

      expect(cubit.state, const UserSearchState());
      expect(profiles.queries, ['ana']);
      await cubit.close();
    });

    test('reports the error message when the search fails', () async {
      final profiles = _FakeProfileRepository()
        ..failure = const AppException('Falha na busca.');
      final cubit = _cubit(profiles: profiles, chat: _FakeChatRepository());

      await cubit.search('ana');

      expect(cubit.state.errorMessage, 'Falha na busca.');
      expect(cubit.state.isLoading, isFalse);
      await cubit.close();
    });
  });

  group('UserSearchCubit.openConversationWith', () {
    test('returns the conversation id the API resolved', () async {
      final chat = _FakeChatRepository();
      final cubit = _cubit(profiles: _FakeProfileRepository(), chat: chat);

      final id = await cubit.openConversationWith(2);

      expect(id, 502);
      expect(chat.startedWith, [2]);
      expect(cubit.state.pendingUserId, isNull);
      await cubit.close();
    });

    test('ignores a second tap while the first is in flight', () async {
      final chat = _FakeChatRepository()..gate = Completer<void>();
      final cubit = _cubit(profiles: _FakeProfileRepository(), chat: chat);

      final first = cubit.openConversationWith(2);
      final second = await cubit.openConversationWith(2);
      chat.gate!.complete();
      await first;

      expect(second, isNull);
      expect(chat.startedWith, [2]);
      await cubit.close();
    });

    test('reports the error and clears the pending user when it fails',
        () async {
      final chat = _FakeChatRepository()
        ..failure = const AppException('Nao foi possivel abrir a conversa.');
      final cubit = _cubit(profiles: _FakeProfileRepository(), chat: chat);

      final id = await cubit.openConversationWith(2);

      expect(id, isNull);
      expect(cubit.state.errorMessage, 'Nao foi possivel abrir a conversa.');
      expect(cubit.state.pendingUserId, isNull);
      await cubit.close();
    });
  });
}
