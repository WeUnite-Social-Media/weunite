import '../core/config/app_config.dart';
import '../core/network/api_client.dart';
import '../core/session/current_user_provider.dart';
import '../core/session/session_events.dart';
import '../core/storage/token_storage.dart';
import '../features/auth/data/auth_remote_data_source.dart';
import '../features/auth/data/auth_repository_impl.dart';
import '../features/auth/domain/repositories/auth_repository.dart';
import '../features/chat/data/chat_realtime_client.dart';
import '../features/chat/data/chat_remote_data_source.dart';
import '../features/chat/data/chat_repository_impl.dart';
import '../features/chat/domain/repositories/chat_repository.dart';
import '../features/feed/data/feed_remote_data_source.dart';
import '../features/feed/data/feed_repository_impl.dart';
import '../features/feed/domain/repositories/feed_repository.dart';
import '../features/opportunities/data/opportunity_remote_data_source.dart';
import '../features/opportunities/data/opportunity_repository_impl.dart';
import '../features/opportunities/domain/repositories/opportunity_repository.dart';
import '../features/profile/data/profile_remote_data_source.dart';
import '../features/profile/data/profile_repository_impl.dart';
import '../features/profile/domain/repositories/profile_repository.dart';

class AppDependencies {
  const AppDependencies({
    required this.authRepository,
    required this.feedRepository,
    required this.opportunityRepository,
    required this.chatRepository,
    required this.profileRepository,
    required this.sessionEvents,
  });

  final AuthRepository authRepository;
  final FeedRepository feedRepository;
  final OpportunityRepository opportunityRepository;
  final ChatRepository chatRepository;
  final ProfileRepository profileRepository;
  final SessionEvents sessionEvents;
}

AppDependencies bootstrap() {
  final config = AppConfig.fromEnvironment();
  final tokenStorage = SecureTokenStorage();
  final sessionEvents = SessionEvents();
  final apiClient = ApiClient(
    config: config,
    tokenStorage: tokenStorage,
    sessionEvents: sessionEvents,
  );

  final authRepository = AuthRepositoryImpl(
    remoteDataSource: AuthRemoteDataSource(apiClient.dio),
    tokenStorage: tokenStorage,
  );
  final currentUserProvider = AuthCurrentUserProvider(authRepository);

  return AppDependencies(
    authRepository: authRepository,
    feedRepository: FeedRepositoryImpl(
      remoteDataSource: FeedRemoteDataSource(apiClient.dio),
      currentUserProvider: currentUserProvider,
    ),
    opportunityRepository: OpportunityRepositoryImpl(
      remoteDataSource: OpportunityRemoteDataSource(apiClient.dio),
    ),
    chatRepository: ChatRepositoryImpl(
      remoteDataSource: ChatRemoteDataSource(apiClient.dio),
      realtimeClient: ChatRealtimeClient(
        config: config,
        tokenStorage: tokenStorage,
      ),
      currentUserProvider: currentUserProvider,
    ),
    profileRepository: ProfileRepositoryImpl(
      remoteDataSource: ProfileRemoteDataSource(apiClient.dio),
      currentUserProvider: currentUserProvider,
    ),
    sessionEvents: sessionEvents,
  );
}
