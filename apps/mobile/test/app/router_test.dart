import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/session/current_user_provider.dart';
import 'package:weunite_mobile/app/app.dart';
import 'package:weunite_mobile/app/bootstrap.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/session/session_events.dart';
import 'package:weunite_mobile/features/auth/domain/entities/app_user.dart';
import 'package:weunite_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:weunite_mobile/features/auth/presentation/screens/login_screen.dart';
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
    currentUser = _alice;
    return _alice;
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

class _EmptyFeedRepository implements FeedRepository {
  @override
  Future<List<Post>> getTimeline({int page = 0}) async => const [];

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

class _EmptyOpportunityRepository implements OpportunityRepository {
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
  final _conversations = const [
    Conversation(id: 7, peerName: 'Bob', peerUsername: 'bob'),
  ];

  @override
  Future<List<Conversation>> getConversations() async => _conversations;

  @override
  Future<Conversation> getConversation(int conversationId) async {
    return _conversations.firstWhere(
      (conversation) => conversation.id == conversationId,
      orElse: () => throw const AppException('Conversa nao encontrada.'),
    );
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
  Future<void> disconnectRealtime() async {}
}

class _EmptyProfileRepository implements ProfileRepository {
  @override
  Future<Profile> getProfileByUsername(String username) async {
    throw const AppException('Nao implementado.');
  }

  @override
  Future<Profile> getProfile(int userId) async {
    throw const AppException('Nao implementado.');
  }

  @override
  Future<Profile> getMyProfile() async {
    return const Profile(
      id: 1,
      name: 'Alice',
      username: 'alice',
      role: 'ATHLETE',
    );
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

AppDependencies _dependencies() {
  final authRepository = _FakeAuthRepository();
  return AppDependencies(
    authRepository: authRepository,
    feedRepository: _EmptyFeedRepository(),
    opportunityRepository: _EmptyOpportunityRepository(),
    chatRepository: _FakeChatRepository(),
    profileRepository: _EmptyProfileRepository(),
    currentUserProvider: AuthCurrentUserProvider(authRepository),
    sessionEvents: SessionEvents(),
  );
}

Future<void> _login(WidgetTester tester) async {
  await tester.enterText(find.byType(TextFormField).first, 'alice');
  await tester.enterText(find.byType(TextFormField).last, 'password123');
  await tester.tap(find.text('Entrar'));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('redirects an unauthenticated user to /login', (tester) async {
    await tester.pumpWidget(WeUniteMobileApp(dependencies: _dependencies()));
    await tester.pumpAndSettle();

    expect(find.byType(LoginScreen), findsOneWidget);
  });

  testWidgets(
    'navigating to /chat/:id opens the matching conversation',
    (tester) async {
      await tester.pumpWidget(WeUniteMobileApp(dependencies: _dependencies()));
      await tester.pumpAndSettle();

      await _login(tester);

      await tester.tap(find.byIcon(Icons.chat_bubble_outline));
      await tester.pumpAndSettle();
      expect(find.text('Bob'), findsWidgets);

      await tester.tap(find.text('Bob').first);
      await tester.pumpAndSettle();

      expect(find.widgetWithText(AppBar, 'Bob'), findsOneWidget);
    },
  );
}
