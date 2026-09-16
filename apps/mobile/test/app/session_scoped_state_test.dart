import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/app/app.dart';
import 'package:weunite_mobile/app/bootstrap.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/session/session_events.dart';
import 'package:weunite_mobile/features/auth/domain/entities/app_user.dart';
import 'package:weunite_mobile/features/auth/domain/repositories/auth_repository.dart';
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
  Future<void> createPost({required String content}) async {}

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
  Future<List<Opportunity>> getOpportunities({
    String? skill,
    int page = 0,
  }) async =>
      const [];

  @override
  Future<void> toggleSaved({
    required int athleteId,
    required int opportunityId,
  }) async {}

  @override
  Future<void> toggleSubscription({
    required int athleteId,
    required int opportunityId,
  }) async {}
}

class _FakeChatRepository implements ChatRepository {
  @override
  Future<List<Conversation>> getConversations(int userId) async => const [];

  @override
  Future<List<ChatMessage>> getMessages({
    required int conversationId,
    required int userId,
  }) async =>
      const [];

  @override
  Future<void> sendMessage({
    required int conversationId,
    required int senderId,
    required String content,
  }) async {}
}

class _FakeProfileRepository implements ProfileRepository {
  @override
  Future<Profile> getProfileByUsername(String username) async {
    throw const AppException('Nao implementado.');
  }

  @override
  Future<Profile> getProfileById(int userId) async {
    return Profile(
      id: userId,
      name: 'User $userId',
      username: 'user$userId',
      role: 'ATHLETE',
    );
  }

  @override
  Future<void> toggleFollow({
    required int followerId,
    required int followedId,
  }) async {}
}

Future<_FakeFeedRepository> _pumpAuthenticatedApp(WidgetTester tester) async {
  final authRepository = _FakeAuthRepository();
  final feedRepository = _FakeFeedRepository(authRepository);
  final dependencies = AppDependencies(
    authRepository: authRepository,
    feedRepository: feedRepository,
    opportunityRepository: _FakeOpportunityRepository(),
    chatRepository: _FakeChatRepository(),
    profileRepository: _FakeProfileRepository(),
    sessionEvents: SessionEvents(),
  );

  await tester.pumpWidget(WeUniteMobileApp(dependencies: dependencies));
  await tester.pumpAndSettle();

  return feedRepository;
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
      final feedRepository = await _pumpAuthenticatedApp(tester);

      await _login(tester, 'alice');
      expect(feedRepository.timelineCalls, 1);

      await tester.tap(find.byType(NavigationDestination).at(1));
      await tester.pumpAndSettle();
      await tester.tap(find.byType(NavigationDestination).at(0));
      await tester.pumpAndSettle();

      expect(feedRepository.timelineCalls, 1);
    },
  );
}
