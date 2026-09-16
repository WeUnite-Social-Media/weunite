import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'core/config/app_config.dart';
import 'core/network/api_client.dart';
import 'core/storage/token_storage.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/data/auth_remote_data_source.dart';
import 'features/auth/data/auth_repository_impl.dart';
import 'features/auth/domain/repositories/auth_repository.dart';
import 'features/auth/presentation/cubit/auth_cubit.dart';
import 'features/auth/presentation/screens/login_screen.dart';
import 'features/chat/data/chat_remote_data_source.dart';
import 'features/chat/data/chat_repository_impl.dart';
import 'features/chat/domain/repositories/chat_repository.dart';
import 'features/chat/presentation/cubit/chat_cubit.dart';
import 'features/feed/data/feed_remote_data_source.dart';
import 'features/feed/data/feed_repository_impl.dart';
import 'features/feed/domain/repositories/feed_repository.dart';
import 'features/feed/presentation/cubit/feed_cubit.dart';
import 'features/home/presentation/app_shell.dart';
import 'features/opportunities/data/opportunity_remote_data_source.dart';
import 'features/opportunities/data/opportunity_repository_impl.dart';
import 'features/opportunities/domain/repositories/opportunity_repository.dart';
import 'features/opportunities/presentation/cubit/opportunities_cubit.dart';
import 'features/profile/data/profile_remote_data_source.dart';
import 'features/profile/data/profile_repository_impl.dart';
import 'features/profile/domain/repositories/profile_repository.dart';
import 'features/profile/presentation/cubit/profile_cubit.dart';

void main() {
  final config = AppConfig.fromEnvironment();
  final tokenStorage = SecureTokenStorage();
  final apiClient = ApiClient(config: config, tokenStorage: tokenStorage);

  final authRepository = AuthRepositoryImpl(
    remoteDataSource: AuthRemoteDataSource(apiClient.dio),
    tokenStorage: tokenStorage,
  );
  final feedRepository = FeedRepositoryImpl(
    remoteDataSource: FeedRemoteDataSource(apiClient.dio),
  );
  final opportunityRepository = OpportunityRepositoryImpl(
    remoteDataSource: OpportunityRemoteDataSource(apiClient.dio),
  );
  final chatRepository = ChatRepositoryImpl(
    remoteDataSource: ChatRemoteDataSource(apiClient.dio),
    config: config,
    tokenStorage: tokenStorage,
  );
  final profileRepository = ProfileRepositoryImpl(
    remoteDataSource: ProfileRemoteDataSource(apiClient.dio),
  );

  runApp(
    WeUniteMobileApp(
      authRepository: authRepository,
      feedRepository: feedRepository,
      opportunityRepository: opportunityRepository,
      chatRepository: chatRepository,
      profileRepository: profileRepository,
    ),
  );
}

class WeUniteMobileApp extends StatelessWidget {
  const WeUniteMobileApp({
    required this.authRepository,
    required this.feedRepository,
    required this.opportunityRepository,
    required this.chatRepository,
    required this.profileRepository,
    super.key,
  });

  final AuthRepository authRepository;
  final FeedRepository feedRepository;
  final OpportunityRepository opportunityRepository;
  final ChatRepository chatRepository;
  final ProfileRepository profileRepository;

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: authRepository),
        RepositoryProvider.value(value: feedRepository),
        RepositoryProvider.value(value: opportunityRepository),
        RepositoryProvider.value(value: chatRepository),
        RepositoryProvider.value(value: profileRepository),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (_) => AuthCubit(authRepository)..restoreSession(),
          ),
          BlocProvider(create: (_) => FeedCubit(feedRepository)),
          BlocProvider(
              create: (_) => OpportunitiesCubit(opportunityRepository),),
          BlocProvider(create: (_) => ChatCubit(chatRepository)),
          BlocProvider(create: (_) => ProfileCubit(profileRepository)),
        ],
        child: MaterialApp(
          title: 'WeUnite',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light(),
          home: BlocBuilder<AuthCubit, AuthState>(
            builder: (context, state) {
              if (state.status == AuthStatus.checking) {
                return const _BootSplash();
              }

              if (state.status == AuthStatus.authenticated) {
                return const AppShell();
              }

              return const LoginScreen();
            },
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
