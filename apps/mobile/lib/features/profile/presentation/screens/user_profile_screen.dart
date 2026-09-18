import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/widgets/async_state_view.dart';
import '../../../chat/domain/repositories/chat_repository.dart';
import '../../../feed/domain/post_events.dart';
import '../../../feed/domain/repositories/feed_repository.dart';
import '../../../opportunities/presentation/widgets/company_opportunities_list.dart';
import '../../domain/repositories/profile_repository.dart';
import '../cubit/profile_posts_cubit.dart';
import '../cubit/user_profile_cubit.dart';
import '../widgets/about_profile.dart';
import '../widgets/profile_header.dart';
import '../widgets/profile_posts_list.dart';
import '../widgets/user_profile_actions.dart';

/// Another user's profile, reached from `/profile/:userId`: header plus the
/// posts they authored.
class UserProfileScreen extends StatelessWidget {
  const UserProfileScreen({required this.userId, super.key});

  final int userId;

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => UserProfileCubit(
            userId: userId,
            repository: context.read<ProfileRepository>(),
            chatRepository: context.read<ChatRepository>(),
          )..load(),
        ),
        BlocProvider(
          create: (context) => ProfilePostsCubit(
            context.read<FeedRepository>(),
            events: context.read<PostEvents>(),
            userId: userId,
          )..loadPosts(),
        ),
      ],
      child: const _UserProfileView(),
    );
  }
}

class _UserProfileView extends StatefulWidget {
  const _UserProfileView();

  @override
  State<_UserProfileView> createState() => _UserProfileViewState();
}

class _UserProfileViewState extends State<_UserProfileView> {
  /// Bumped on pull-to-refresh so the company opportunities list reloads too.
  int _refreshTick = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: MultiBlocListener(
        listeners: [
          BlocListener<ProfilePostsCubit, ProfilePostsState>(
            listenWhen: (_, current) => current.actionErrorMessage != null,
            listener: (context, state) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.actionErrorMessage!)),
              );
              context.read<ProfilePostsCubit>().dismissActionError();
            },
          ),
          BlocListener<UserProfileCubit, UserProfileState>(
            listenWhen: (_, current) => current.actionErrorMessage != null,
            listener: (context, state) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.actionErrorMessage!)),
              );
              context.read<UserProfileCubit>().dismissActionError();
            },
          ),
        ],
        child: BlocBuilder<UserProfileCubit, UserProfileState>(
          builder: (context, state) {
            return AsyncStateView(
              isLoading: state.isLoading,
              errorMessage: state.errorMessage,
              onRetry: () => context.read<UserProfileCubit>().load(),
              child: state.profile == null
                  ? const SizedBox.shrink()
                  : NotificationListener<ScrollNotification>(
                      onNotification: (notification) {
                        if (notification.metrics.extentAfter < 320) {
                          context.read<ProfilePostsCubit>().loadNextPage();
                        }
                        return false;
                      },
                      child: RefreshIndicator(
                        onRefresh: () {
                          setState(() => _refreshTick++);
                          return Future.wait([
                            context.read<UserProfileCubit>().load(),
                            context.read<ProfilePostsCubit>().loadPosts(),
                          ]);
                        },
                        child: ListView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: const EdgeInsets.only(bottom: 24),
                          children: [
                            ProfileHeader(
                              profile: state.profile!,
                              actions: const UserProfileActions(),
                            ),
                            AboutProfile(profile: state.profile!),
                            if (state.profile!.isCompany) ...[
                              Padding(
                                padding:
                                    const EdgeInsets.fromLTRB(16, 16, 16, 8),
                                child: Text(
                                  'Oportunidades da empresa',
                                  style:
                                      Theme.of(context).textTheme.titleMedium,
                                ),
                              ),
                              CompanyOpportunitiesList(
                                companyId: state.profile!.id,
                                refreshTick: _refreshTick,
                              ),
                            ],
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                              child: Text(
                                'Posts',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                            ),
                            const ProfilePostsList(
                              emptyMessage: 'Nenhuma publicacao ainda.',
                            ),
                          ],
                        ),
                      ),
                    ),
            );
          },
        ),
      ),
    );
  }
}
