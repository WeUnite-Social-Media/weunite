import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/presentation/cubit/auth_cubit.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/auth/presentation/screens/reset_password_screen.dart';
import '../features/auth/presentation/screens/send_reset_password_screen.dart';
import '../features/auth/presentation/screens/signup_screen.dart';
import '../features/auth/presentation/screens/verify_email_screen.dart';
import '../features/auth/presentation/screens/verify_reset_token_screen.dart';
import '../features/chat/domain/repositories/chat_repository.dart';
import '../features/chat/presentation/cubit/chat_cubit.dart';
import '../features/chat/presentation/screens/conversation_route_screen.dart';
import '../features/chat/presentation/screens/conversations_screen.dart';
import '../features/chat/presentation/screens/new_conversation_screen.dart';
import '../features/feed/domain/post_events.dart';
import '../features/feed/domain/repositories/feed_repository.dart';
import '../features/feed/presentation/cubit/feed_cubit.dart';
import '../features/feed/presentation/screens/feed_screen.dart';
import '../features/feed/presentation/screens/post_detail_screen.dart';
import '../features/home/presentation/app_shell.dart';
import '../features/notifications/domain/repositories/notification_repository.dart';
import '../features/notifications/presentation/cubit/notifications_cubit.dart';
import '../features/notifications/presentation/screens/notifications_screen.dart';
import '../features/opportunities/domain/repositories/opportunity_repository.dart';
import '../features/opportunities/presentation/cubit/opportunities_cubit.dart';
import '../features/opportunities/presentation/screens/my_applications_screen.dart';
import '../features/opportunities/presentation/screens/opportunities_screen.dart';
import '../features/opportunities/presentation/screens/saved_opportunities_screen.dart';
import '../features/profile/domain/repositories/profile_repository.dart';
import '../features/profile/presentation/cubit/profile_cubit.dart';
import '../features/profile/presentation/cubit/profile_posts_cubit.dart';
import '../features/profile/presentation/screens/profile_screen.dart';
import '../features/profile/presentation/screens/user_profile_screen.dart';
import '../features/search/presentation/screens/search_screen.dart';

/// Route map (kept in sync with `apps/mobile/AGENTS.md` / `README.md`):
/// - `/splash`: shown while `AuthCubit` is restoring the session.
/// - `/login`, `/signup`: unauthenticated screens.
/// - `/feed`, `/opportunities`, `/chat`, `/profile`: the four bottom-nav
///   branches of the `StatefulShellRoute`, each keeping its own state.
/// - `/chat/:conversationId`: pushed full-screen, resolves the id to a
///   `Conversation` before rendering `ConversationScreen`.
/// - `/profile/:userId`: pushed full-screen, a third party's profile.
/// - `/posts/:postId`: placeholder (see `PostDetailScreen`).
/// - `/opportunities/applications`, `/opportunities/saved`: pushed
///   full-screen, athlete-only "Minhas candidaturas" / "Oportunidades
///   salvas", reached from the Opportunities tab's navigation entries.
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
        // `?tab=company` opens the club form directly, the phone equivalent of
        // the web's separate `/auth/signupcompany` route.
        builder: (context, state) => SignUpScreen(
          initialTab: state.uri.queryParameters['tab'] == 'company'
              ? SignUpTab.company
              : SignUpTab.athlete,
        ),
      ),
      GoRoute(
        path: '/verify-email/:email',
        builder: (context, state) => VerifyEmailScreen(
          email: state.pathParameters['email']!,
        ),
      ),
      GoRoute(
        path: '/send-reset-password',
        builder: (context, state) => const SendResetPasswordScreen(),
      ),
      GoRoute(
        path: '/verify-reset-token/:email',
        builder: (context, state) => VerifyResetTokenScreen(
          email: state.pathParameters['email']!,
        ),
      ),
      GoRoute(
        path: '/reset-password/:verificationToken',
        builder: (context, state) => ResetPasswordScreen(
          verificationToken: state.pathParameters['verificationToken']!,
        ),
      ),
      // Declared before `/chat/:conversationId` so "new" is not parsed as an id.
      GoRoute(
        path: '/chat/new',
        builder: (context, state) => const NewConversationScreen(),
      ),
      GoRoute(
        path: '/chat/:conversationId',
        builder: (context, state) => ConversationRouteScreen(
          conversationId: int.parse(state.pathParameters['conversationId']!),
        ),
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) => const SearchScreen(),
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
      GoRoute(
        path: '/opportunities/applications',
        builder: (context, state) => const MyApplicationsScreen(),
      ),
      GoRoute(
        path: '/opportunities/saved',
        builder: (context, state) => const SavedOpportunitiesScreen(),
      ),
      GoRoute(
        path: '/notifications',
        // Pushed outside the shell, so it's a sibling of the route that
        // hosts the session-scoped `NotificationsCubit`, not a descendant —
        // `context.read` wouldn't find it here (same reasoning as bottom
        // sheets, see `apps/mobile/AGENTS.md`). The bell in `AppShell` passes
        // its own `NotificationsCubit` instance via `extra` when pushing;
        // a route-scoped fallback covers the (currently unused) case of
        // reaching this route without it, e.g. a future deep link.
        builder: (context, state) {
          final existing = state.extra;
          if (existing is NotificationsCubit) {
            return BlocProvider.value(
              value: existing,
              child: const NotificationsScreen(),
            );
          }
          return BlocProvider(
            create: (context) =>
                NotificationsCubit(context.read<NotificationRepository>())
                  ..load(),
            child: const NotificationsScreen(),
          );
        },
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          final user = context.watch<AuthCubit>().state.user;
          if (user == null) {
            return const _SplashScreen();
          }
          return MultiBlocProvider(
            key: ValueKey(user.id),
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
                create: (context) => ChatCubit(
                  context.read<ChatRepository>(),
                  currentUserId: user.id,
                ),
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
              BlocProvider(
                create: (context) => NotificationsCubit(
                  context.read<NotificationRepository>(),
                )..load(),
              ),
            ],
            child: AppShell(navigationShell: navigationShell),
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

/// Routes an unauthenticated visitor is allowed to be on: login, both sign-up
/// forms, e-mail verification and the three password-recovery steps. Anything
/// else sends them back to `/login`.
const _publicRoutePrefixes = [
  '/login',
  '/signup',
  '/verify-email',
  '/send-reset-password',
  '/verify-reset-token',
  '/reset-password',
];

String? _redirect(AuthCubit authCubit, GoRouterState state) {
  final status = authCubit.state.status;
  final location = state.matchedLocation;
  final atSplash = location == '/splash';
  final atAuthRoute = _publicRoutePrefixes.any(
    (prefix) => location == prefix || location.startsWith('$prefix/'),
  );

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
