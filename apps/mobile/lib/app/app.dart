import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../core/session/current_user_provider.dart';
import '../core/theme/app_theme.dart';
import '../features/auth/domain/repositories/auth_repository.dart';
import '../features/auth/presentation/cubit/auth_cubit.dart';
import '../features/chat/domain/repositories/chat_repository.dart';
import '../features/feed/domain/post_events.dart';
import '../features/feed/domain/repositories/feed_repository.dart';
import '../features/opportunities/domain/repositories/opportunity_repository.dart';
import '../features/profile/domain/repositories/profile_repository.dart';
import 'bootstrap.dart';
import 'router.dart';

class WeUniteMobileApp extends StatefulWidget {
  const WeUniteMobileApp({required this.dependencies, super.key});

  final AppDependencies dependencies;

  @override
  State<WeUniteMobileApp> createState() => _WeUniteMobileAppState();
}

class _WeUniteMobileAppState extends State<WeUniteMobileApp> {
  late final AuthCubit _authCubit;
  late final GoRouterRefreshStream _routerRefresh;
  late final GoRouter _router;

  /// App-wide (not session-keyed) so pushed routes outside the tab shell,
  /// such as `/profile/:userId`, can publish and listen too. Events carry no
  /// user data, and every listening cubit is closed when the session ends.
  final _postEvents = PostEvents();

  @override
  void initState() {
    super.initState();
    _authCubit = AuthCubit(
      widget.dependencies.authRepository,
      widget.dependencies.sessionEvents,
    )..restoreSession();
    _routerRefresh = GoRouterRefreshStream(_authCubit.stream);
    _router = buildRouter(
      authCubit: _authCubit,
      refreshListenable: _routerRefresh,
    );
  }

  @override
  void dispose() {
    _router.dispose();
    _routerRefresh.dispose();
    _authCubit.close();
    _postEvents.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dependencies = widget.dependencies;
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<AuthRepository>.value(
          value: dependencies.authRepository,
        ),
        RepositoryProvider<FeedRepository>.value(
          value: dependencies.feedRepository,
        ),
        RepositoryProvider<OpportunityRepository>.value(
          value: dependencies.opportunityRepository,
        ),
        RepositoryProvider<ChatRepository>.value(
          value: dependencies.chatRepository,
        ),
        RepositoryProvider<ProfileRepository>.value(
          value: dependencies.profileRepository,
        ),
        RepositoryProvider<CurrentUserProvider>.value(
          value: dependencies.currentUserProvider,
        ),
        RepositoryProvider<PostEvents>.value(value: _postEvents),
      ],
      child: BlocProvider.value(
        value: _authCubit,
        child: BlocListener<AuthCubit, AuthState>(
          listenWhen: (previous, current) =>
              previous.status == AuthStatus.authenticated &&
              current.status != AuthStatus.authenticated,
          listener: (context, state) {
            context.read<ChatRepository>().disconnectRealtime();
          },
          child: MaterialApp.router(
            title: 'WeUnite',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            routerConfig: _router,
          ),
        ),
      ),
    );
  }
}
