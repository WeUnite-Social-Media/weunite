import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/presentation/cubit/auth_cubit.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/auth/presentation/screens/signup_screen.dart';
import '../features/chat/domain/repositories/chat_repository.dart';
import '../features/chat/presentation/cubit/chat_cubit.dart';
import '../features/chat/presentation/screens/conversation_route_screen.dart';
import '../features/chat/presentation/screens/conversations_screen.dart';
import '../features/feed/domain/post_events.dart';
import '../features/feed/domain/repositories/feed_repository.dart';
import '../features/feed/presentation/cubit/feed_cubit.dart';
import '../features/feed/presentation/screens/feed_screen.dart';
import '../features/feed/presentation/screens/post_detail_screen.dart';
import '../features/home/presentation/app_shell.dart';
import '../features/opportunities/domain/repositories/opportunity_repository.dart';
import '../features/opportunities/presentation/cubit/opportunities_cubit.dart';
import '../features/opportunities/presentation/screens/opportunities_screen.dart';
import '../features/profile/domain/repositories/profile_repository.dart';
import '../features/profile/presentation/cubit/profile_cubit.dart';
import '../features/profile/presentation/cubit/profile_posts_cubit.dart';
import '../features/profile/presentation/screens/profile_screen.dart';
import '../features/profile/presentation/screens/user_profile_screen.dart';

/// Route map (kept in sync with `apps/mobile/AGENTS.md` / `README.md`):
/// - `/splash`: shown while `AuthCubit` is restoring the session.
/// - `/login`, `/signup`: unauthenticated screens.
/// - `/feed`, `/opportunities`, `/chat`, `/profile`: the four bottom-nav
///   branches of the `StatefulShellRoute`, each keeping its own state.
/// - `/chat/:conversationId`: pushed full-screen, resolves the id to a
///   `Conversation` before rendering `ConversationScreen`.
/// - `/profile/:userId`: pushed full-screen, a third party's profile.
/// - `/posts/:postId`: placeholder (see `PostDetailScreen`).
GoRouter buildRouter({
  required AuthCubit authCubit,
  required Listenable refreshListenable,
}) {
  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: refreshListenable,
    redirect: (context, state) => _redirect(authCubit, state),
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const _SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignUpScreen(),
      ),
      GoRoute(
        path: '/chat/:conversationId',
        builder: (context, state) => ConversationRouteScreen(
          conversationId: int.parse(state.pathParameters['conversationId']!),
        ),
      ),
      GoRoute(
        path: '/profile/:userId',
        builder: (context, state) => UserProfileScreen(
          userId: int.parse(state.pathParameters['userId']!),
        ),
      ),
      GoRoute(
        path: '/posts/:postId',
        builder: (context, state) => PostDetailScreen(
          postId: int.parse(state.pathParameters['postId']!),
        ),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          final user = context.watch<AuthCubit>().state.user;
          if (user == null) {
            return const _SplashScreen();
          }
          // Keyed by user so the event bus and every cubit are rebuilt when
          // the signed-in user changes.
          return RepositoryProvider<PostEvents>(
            key: ValueKey(user.id),
            create: (_) => PostEvents(),
            dispose: (events) => events.dispose(),
            child: MultiBlocProvider(
              providers: [
                BlocProvider(
                  create: (context) => FeedCubit(
                    context.read<FeedRepository>(),
                    events: context.read<PostEvents>(),
                  ),
                ),
                BlocProvider(
                  create: (context) => OpportunitiesCubit(
                    context.read<OpportunityRepository>(),
                  ),
                ),
                BlocProvider(
                  create: (context) =>
                      ChatCubit(context.read<ChatRepository>()),
                ),
                BlocProvider(
                  create: (context) =>
                      ProfileCubit(context.read<ProfileRepository>()),
                ),
                BlocProvider(
                  create: (context) => ProfilePostsCubit(
                    context.read<FeedRepository>(),
                    events: context.read<PostEvents>(),
                  ),
                ),
              ],
              child: AppShell(navigationShell: navigationShell),
            ),
          );
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/feed',
                builder: (context, state) => const FeedScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/opportunities',
                builder: (context, state) => const OpportunitiesScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/chat',
                builder: (context, state) => const ConversationsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

String? _redirect(AuthCubit authCubit, GoRouterState state) {
  final status = authCubit.state.status;
  final atSplash = state.matchedLocation == '/splash';
  final atAuthRoute =
      state.matchedLocation == '/login' || state.matchedLocation == '/signup';

  if (status == AuthStatus.checking) {
    return atSplash ? null : '/splash';
  }

  final authenticated = status == AuthStatus.authenticated;
  if (!authenticated) {
    return atAuthRoute ? null : '/login';
  }

  if (atAuthRoute || atSplash) {
    return '/feed';
  }
  return null;
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

/// Notifies `GoRouter` (via `refreshListenable`) whenever [stream] emits,
/// so `redirect` re-runs on every `AuthCubit` state change.
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
