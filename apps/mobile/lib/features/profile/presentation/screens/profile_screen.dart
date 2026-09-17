import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/async_state_view.dart';
import '../cubit/profile_cubit.dart';
import '../cubit/profile_posts_cubit.dart';
import '../widgets/profile_header.dart';
import '../widgets/profile_posts_list.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  static const _postsTab = 0;

  final _scrollController = ScrollController();
  int _tabIndex = _postsTab;

  @override
  void initState() {
    super.initState();
    if (!context.read<ProfileCubit>().state.hasLoaded) {
      context.read<ProfileCubit>().loadMyProfile();
    }
    if (!context.read<ProfilePostsCubit>().state.hasLoaded) {
      context.read<ProfilePostsCubit>().loadPosts();
    }
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController
      ..removeListener(_onScroll)
      ..dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_tabIndex != _postsTab || !_scrollController.hasClients) {
      return;
    }
    if (_scrollController.position.extentAfter < 320) {
      context.read<ProfilePostsCubit>().loadNextPage();
    }
  }

  Future<void> _refresh() {
    return Future.wait([
      context.read<ProfileCubit>().loadMyProfile(),
      context.read<ProfilePostsCubit>().loadPosts(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocListener(
      listeners: [
        BlocListener<ProfileCubit, ProfileState>(
          listenWhen: (_, current) => current.actionErrorMessage != null,
          listener: (context, state) {
            _showError(context, state.actionErrorMessage!);
            context.read<ProfileCubit>().dismissActionError();
          },
        ),
        BlocListener<ProfilePostsCubit, ProfilePostsState>(
          listenWhen: (_, current) => current.actionErrorMessage != null,
          listener: (context, state) {
            _showError(context, state.actionErrorMessage!);
            context.read<ProfilePostsCubit>().dismissActionError();
          },
        ),
      ],
      child: BlocBuilder<ProfileCubit, ProfileState>(
        builder: (context, state) {
          final isCompany = state.profile?.isCompany == true;
          final tabCount = isCompany ? 3 : 2;
          final tabIndex = _tabIndex < tabCount ? _tabIndex : _postsTab;

          return AsyncStateView(
            isLoading: state.isLoading,
            errorMessage: state.loadErrorMessage,
            onRetry: () => context.read<ProfileCubit>().loadMyProfile(),
            child: DefaultTabController(
              length: tabCount,
              initialIndex: tabIndex,
              child: RefreshIndicator(
                onRefresh: _refresh,
                child: ListView(
                  controller: _scrollController,
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.only(bottom: 24),
                  children: [
                    if (state.profile != null)
                      ProfileHeader(profile: state.profile!),
                    TabBar(
                      labelColor: AppColors.primary,
                      indicatorColor: AppColors.accentGreen,
                      onTap: (index) => setState(() => _tabIndex = index),
                      tabs: [
                        const Tab(text: 'Posts'),
                        const Tab(text: 'Sobre'),
                        if (isCompany) const Tab(text: 'Oportunidades'),
                      ],
                    ),
                    switch (tabIndex) {
                      _postsTab => const ProfilePostsList(
                          emptyMessage: 'Voce ainda nao publicou nada.',
                        ),
                      1 => _CenteredMessage(
                          state.profile?.bio ?? 'Sem bio ainda.',
                        ),
                      _ => const _CenteredMessage('Oportunidades da empresa'),
                    },
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  void _showError(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}

class _CenteredMessage extends StatelessWidget {
  const _CenteredMessage(this.message);

  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 16),
      child: Center(child: Text(message, textAlign: TextAlign.center)),
    );
  }
}
