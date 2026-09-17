import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../core/theme/app_theme.dart';
import '../features/auth/domain/repositories/auth_repository.dart';
import '../features/auth/presentation/cubit/auth_cubit.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/chat/domain/repositories/chat_repository.dart';
import '../features/chat/presentation/cubit/chat_cubit.dart';
import '../features/feed/domain/repositories/feed_repository.dart';
import '../features/feed/presentation/cubit/feed_cubit.dart';
import '../features/home/presentation/app_shell.dart';
import '../features/opportunities/domain/repositories/opportunity_repository.dart';
import '../features/opportunities/presentation/cubit/opportunities_cubit.dart';
import '../features/profile/domain/repositories/profile_repository.dart';
import '../features/profile/presentation/cubit/profile_cubit.dart';
import 'bootstrap.dart';

class WeUniteMobileApp extends StatefulWidget {
  const WeUniteMobileApp({required this.dependencies, super.key});

  final AppDependencies dependencies;

  @override
  State<WeUniteMobileApp> createState() => _WeUniteMobileAppState();
}

class _WeUniteMobileAppState extends State<WeUniteMobileApp> {
  final _navigatorKey = GlobalKey<NavigatorState>();

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
      ],
      child: BlocProvider(
        create: (context) => AuthCubit(
          context.read<AuthRepository>(),
          dependencies.sessionEvents,
        )..restoreSession(),
        child: BlocListener<AuthCubit, AuthState>(
          listenWhen: (previous, current) =>
              previous.status == AuthStatus.authenticated &&
              current.status != AuthStatus.authenticated,
          listener: (context, state) {
            context.read<ChatRepository>().disconnectRealtime();
            _navigatorKey.currentState?.popUntil((route) => route.isFirst);
          },
          child: MaterialApp(
            navigatorKey: _navigatorKey,
            title: 'WeUnite',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            home: BlocBuilder<AuthCubit, AuthState>(
              builder: (context, state) {
                if (state.status == AuthStatus.checking) {
                  return const _BootSplash();
                }

                final user = state.user;
                if (state.status == AuthStatus.authenticated && user != null) {
                  return MultiBlocProvider(
                    key: ValueKey(user.id),
                    providers: [
                      BlocProvider(
                        create: (context) =>
                            FeedCubit(context.read<FeedRepository>()),
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
                    ],
                    child: const AppShell(),
                  );
                }

                return const LoginScreen();
              },
            ),
          ),
        ),
      ),
    );
  }
}

class _BootSplash extends StatelessWidget {
  const _BootSplash();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
