import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/chat/domain/entities/chat_realtime_event.dart';
import 'package:weunite_mobile/features/chat/domain/entities/conversation.dart';
import 'package:weunite_mobile/features/chat/domain/repositories/chat_repository.dart';
import 'package:weunite_mobile/features/profile/domain/entities/profile.dart';
import 'package:weunite_mobile/features/profile/domain/repositories/profile_repository.dart';
import 'package:weunite_mobile/features/profile/presentation/cubit/user_profile_cubit.dart';

Profile _profile({bool isFollowing = false, int followers = 10}) => Profile(
      id: 2,
      name: 'Ana Teste',
      username: 'anateste',
      role: 'ATHLETE',
      followersCount: followers,
      isFollowing: isFollowing,
    );

class _FakeProfileRepository implements ProfileRepository {
  Profile profile = _profile();
  bool toggleResult = true;
  AppException? toggleFailure;
  int toggleCalls = 0;

  @override
  Future<Profile> getProfile(int userId) async => profile;

  @override
  Future<bool> toggleFollow({required int followedId}) async {
    toggleCalls++;
    if (toggleFailure != null) {
      throw toggleFailure!;
    }
    return toggleResult;
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _FakeChatRepository implements ChatRepository {
  final startedWith = <int>[];
  AppException? failure;

  @override
  Future<Conversation> startConversationWith(int userId) async {
    startedWith.add(userId);
    if (failure != null) {
      throw failure!;
    }
    return Conversation(id: 7, peerUserId: userId);
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
  Stream<ChatRealtimeEvent> watchConversationRead(int conversationId) =>
      const Stream.empty();

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

UserProfileCubit _cubit(
  _FakeProfileRepository profiles, {
  _FakeChatRepository? chat,
}) {
  return UserProfileCubit(
    userId: 2,
    repository: profiles,
    chatRepository: chat ?? _FakeChatRepository(),
  );
}

void main() {
  group('UserProfileCubit.toggleFollow', () {
    test('follows and bumps the follower count', () async {
      final profiles = _FakeProfileRepository();
      final cubit = _cubit(profiles);
      await cubit.load();

      await cubit.toggleFollow();

      expect(cubit.state.profile!.isFollowing, isTrue);
      expect(cubit.state.profile!.followersCount, 11);
      expect(cubit.state.isFollowPending, isFalse);
      await cubit.close();
    });

    test('unfollowing lowers the follower count', () async {
      final profiles = _FakeProfileRepository()
        ..profile = _profile(isFollowing: true, followers: 11)
        ..toggleResult = false;
      final cubit = _cubit(profiles);
      await cubit.load();

      await cubit.toggleFollow();

      expect(cubit.state.profile!.isFollowing, isFalse);
      expect(cubit.state.profile!.followersCount, 10);
      await cubit.close();
    });

    test('reverts and reports when the API rejects it', () async {
      final profiles = _FakeProfileRepository()
        ..toggleFailure = const AppException('Nao foi possivel seguir.');
      final cubit = _cubit(profiles);
      await cubit.load();

      await cubit.toggleFollow();

      expect(cubit.state.profile!.isFollowing, isFalse);
      expect(cubit.state.profile!.followersCount, 10);
      expect(cubit.state.actionErrorMessage, 'Nao foi possivel seguir.');
      await cubit.close();
    });

    test('keeps the state the API reports even when it disagrees', () async {
      // The web infers the new state from the response message; here the API
      // answer wins, so a toggle that did not take effect is not shown as done.
      final profiles = _FakeProfileRepository()..toggleResult = false;
      final cubit = _cubit(profiles);
      await cubit.load();

      await cubit.toggleFollow();

      expect(cubit.state.profile!.isFollowing, isFalse);
      expect(cubit.state.profile!.followersCount, 10);
      await cubit.close();
    });
  });

  group('UserProfileCubit.openConversation', () {
    test('returns the conversation id for this user', () async {
      final chat = _FakeChatRepository();
      final cubit = _cubit(_FakeProfileRepository(), chat: chat);
      await cubit.load();

      final id = await cubit.openConversation();

      expect(id, 7);
      expect(chat.startedWith, [2]);
      expect(cubit.state.isConversationPending, isFalse);
      await cubit.close();
    });

    test('reports the failure instead of navigating', () async {
      final chat = _FakeChatRepository()
        ..failure = const AppException('Chat indisponivel.');
      final cubit = _cubit(_FakeProfileRepository(), chat: chat);
      await cubit.load();

      final id = await cubit.openConversation();

      expect(id, isNull);
      expect(cubit.state.actionErrorMessage, 'Chat indisponivel.');
      await cubit.close();
    });
  });

  group('Profile.age', () {
    test('counts whole years, like the web "Sobre" section', () {
      final birth = DateTime.now().subtract(const Duration(days: 365 * 20 + 5));
      final profile = Profile(
        id: 1,
        name: 'A',
        username: 'a',
        role: 'ATHLETE',
        birthDate: birth,
      );

      expect(profile.age, 20);
    });

    test('is null without a birth date', () {
      expect(_profile().age, isNull);
    });
  });
}
