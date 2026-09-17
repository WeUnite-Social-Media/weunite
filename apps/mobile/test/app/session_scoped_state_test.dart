import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/app/app.dart';
import 'package:weunite_mobile/app/bootstrap.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/session/session_events.dart';
import 'package:weunite_mobile/features/auth/domain/entities/app_user.dart';
import 'package:weunite_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:weunite_mobile/features/chat/domain/entities/chat_realtime_event.dart';
import 'package:weunite_mobile/features/chat/domain/entities/conversation.dart';
import 'package:weunite_mobile/features/chat/domain/repositories/chat_repository.dart';
import 'package:weunite_mobile/features/feed/domain/entities/comment.dart';
import 'package:weunite_mobile/features/feed/domain/entities/post.dart';
import 'package:weunite_mobile/features/feed/domain/repositories/feed_repository.dart';
import 'package:weunite_mobile/features/opportunities/domain/entities/opportunity.dart';
import 'package:weunite_mobile/features/opportunities/domain/repositories/opportunity_repository.dart';
import 'package:weunite_mobile/features/profile/domain/entities/profile.dart';
import 'package:weunite_mobile/features/profile/domain/repositories/profile_repository.dart';

const _alice = AppUser(
  id: 1,
  name: 'Alice',
  username: 'alice',
  email: 'alice@weunite.com',
  role: 'ATHLETE',
);

const _bob = AppUser(
  id: 2,
  name: 'Bob',
  username: 'bob',
  email: 'bob@weunite.com',
  role: 'ATHLETE',
);

class _FakeAuthRepository implements AuthRepository {
  @override
  AppUser? currentUser;

  @override
  Future<AppUser?> restoreSession() async => null;

  @override
  Future<AppUser> login({
    required String username,
    required String password,
  }) async {
    currentUser = username == _alice.username ? _alice : _bob;
    return currentUser!;
  }

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
  Future<void> logout() async {
    currentUser = null;
  }
}

class _FakeFeedRepository implements FeedRepository {
  _FakeFeedRepository(this._auth);

  final _FakeAuthRepository _auth;
  int timelineCalls = 0;

  @override
  Future<List<Post>> getTimeline({int page = 0}) async {
    timelineCalls++;
    final userId = _auth.currentUser?.id;
    if (userId == _alice.id) {
      return [
        Post(
          id: 1,
          content: 'Post da Alice',
          authorName: _alice.name,
          authorUsername: _alice.username,
          createdAt: DateTime(2024, 1, 1),
        ),
      ];
    }
    if (userId == _bob.id) {
      return [
        Post(
          id: 2,
          content: 'Post do Bob',
          authorName: _bob.name,
          authorUsername: _bob.username,
          createdAt: DateTime(2024, 1, 2),
        ),
      ];
    }
    return const [];
  }

  @override
  Future<List<Post>> getMyPosts({int page = 0}) async => const [];

  @override
  Future<List<Post>> getUserPosts({required int userId, int page = 0}) async =>
      const [];

  @override
  Future<List<Post>> searchPosts({required String query, int page = 0}) async =>
      const [];

  @override
  Future<void> createPost({
    required String content,
    String? imagePath,
  }) async {}

  @override
  Future<void> toggleLike({required int postId}) async {}

  @override
  Future<List<Comment>> getComments({
    required int postId,
    int page = 0,
  }) async =>
      const [];

  @override
  Future<void> createComment({
    required int postId,
    required String content,
  }) async {}
}

class _FakeOpportunityRepository implements OpportunityRepository {
  @override
  Future<List<Opportunity>> getOpportunities({int page = 0}) async => const [];

  @override
  Future<List<Opportunity>> getCompanyOpportunities({
    required int companyId,
    int page = 0,
  }) async =>
      const [];

  @override
  Future<bool> toggleSaved({required int opportunityId}) async => true;

  @override
  Future<bool> toggleSubscription({required int opportunityId}) async => true;
}

class _FakeChatRepository implements ChatRepository {
  int disconnectCalls = 0;

  @override
  Future<List<Conversation>> getConversations() async => const [];

  @override
  Future<Conversation> getConversation(int conversationId) async {
    throw const AppException('Nao implementado.');
  }

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
  Future<Conversation> startConversationWith(int userId) async =>
      throw UnimplementedError();

  @override
  Future<void> markConversationAsRead(int conversationId) async {}

  @override
  Future<void> disconnectRealtime() async {
    disconnectCalls++;
  }
}

class _FakeProfileRepository implements ProfileRepository {
  @override
  Future<Profile> getProfileByUsername(String username) async {
    throw const AppException('Nao implementado.');
  }

  @override
  Future<Profile> getProfile(int userId) async {
    return Profile(
      id: userId,
      name: 'User $userId',
      username: 'user$userId',
      role: 'ATHLETE',
    );
  }

  @override
  Future<Profile> getMyProfile() async {
    return const Profile(id: 0, name: 'Me', username: 'me', role: 'ATHLETE');
  }

  @override
  Future<List<Profile>> searchUsers(String query) async => const [];

  @override
  Future<Profile> updateMyProfile({
    String? name,
    String? username,
    String? bio,
    bool? isPrivate,
    double? height,
    double? weight,
    String? footDomain,
    String? position,
    DateTime? birthDate,
    List<String>? skills,
    String? profileImagePath,
    String? bannerImagePath,
  }) async =>
      throw UnimplementedError();

  @override
  Future<Profile> deleteMyBanner() async => throw UnimplementedError();

  @override
  Future<List<String>> getAvailableSkills() async => const [];

  @override
  Future<void> toggleFollow({required int followedId}) async {}
}

typedef _Repositories = ({
  _FakeFeedRepository feed,
  _FakeChatRepository chat,
});

Future<_Repositories> _pumpAuthenticatedApp(WidgetTester tester) async {
  final authRepository = _FakeAuthRepository();
  final feedRepository = _FakeFeedRepository(authRepository);
  final chatRepository = _FakeChatRepository();
  final dependencies = AppDependencies(
    authRepository: authRepository,
    feedRepository: feedRepository,
    opportunityRepository: _FakeOpportunityRepository(),
    chatRepository: chatRepository,
    profileRepository: _FakeProfileRepository(),
    sessionEvents: SessionEvents(),
  );

  await tester.pumpWidget(WeUniteMobileApp(dependencies: dependencies));
  await tester.pumpAndSettle();

  return (feed: feedRepository, chat: chatRepository);
}

Future<void> _login(WidgetTester tester, String username) async {
  await tester.enterText(find.byType(TextFormField).first, username);
  await tester.enterText(find.byType(TextFormField).last, 'password123');
  await tester.tap(find.text('Entrar'));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets(
    'logout followed by login as a different user does not leak the '
    'previous user posts',
    (tester) async {
      await _pumpAuthenticatedApp(tester);

      await _login(tester, 'alice');
      expect(find.text('Post da Alice'), findsOneWidget);

      await tester.tap(find.byIcon(Icons.logout));
      await tester.pumpAndSettle();

      await _login(tester, 'bob');
      expect(find.text('Post do Bob'), findsOneWidget);
      expect(find.text('Post da Alice'), findsNothing);
    },
  );

  testWidgets(
    'switching tabs and returning to feed does not reload the timeline',
    (tester) async {
      final repositories = await _pumpAuthenticatedApp(tester);

      await _login(tester, 'alice');
      expect(repositories.feed.timelineCalls, 1);

      await tester.tap(find.byType(NavigationDestination).at(1));
      await tester.pumpAndSettle();
      await tester.tap(find.byType(NavigationDestination).at(0));
      await tester.pumpAndSettle();

      expect(repositories.feed.timelineCalls, 1);
    },
  );

  testWidgets(
    'logging out disconnects the chat realtime client',
    (tester) async {
      final repositories = await _pumpAuthenticatedApp(tester);

      await _login(tester, 'alice');
      expect(repositories.chat.disconnectCalls, 0);

      await tester.tap(find.byIcon(Icons.logout));
      await tester.pumpAndSettle();

      expect(repositories.chat.disconnectCalls, 1);
    },
  );
}
