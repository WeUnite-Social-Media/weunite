import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/widgets/async_state_view.dart';
import '../../../opportunities/presentation/widgets/company_opportunities_list.dart';
import '../../../opportunities/presentation/widgets/saved_opportunities_list.dart';
import '../../domain/entities/profile.dart';
import '../cubit/profile_cubit.dart';
import '../cubit/profile_posts_cubit.dart';
import '../widgets/about_profile.dart';
import '../widgets/profile_header.dart';
import '../widgets/profile_posts_list.dart';
import '../widgets/profile_tabs.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  static const _postsTab = 0;

  final _scrollController = ScrollController();
  int _tabIndex = _postsTab;

  /// Bumped on pull-to-refresh so the company opportunities list reloads too.
  int _refreshTick = 0;

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
    setState(() => _refreshTick++);
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
          // A company publishes opportunities; an athlete saves them. Same
          // split the web makes between CompanyOpportunities and the saved
          // opportunities page.
          final labels = [
            'Posts',
            'Sobre',
            if (isCompany) 'Oportunidades' else 'Salvos',
          ];
          final tabIndex = _tabIndex < labels.length ? _tabIndex : _postsTab;

          return AsyncStateView(
            isLoading: state.isLoading,
            errorMessage: state.loadErrorMessage,
            onRetry: () => context.read<ProfileCubit>().loadMyProfile(),
            child: RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.only(bottom: 24),
                children: [
                  if (state.profile != null) ...[
                    ProfileHeader(profile: state.profile!),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                      child: OutlinedButton.icon(
                        onPressed: () => _editProfile(context, state.profile!),
                        icon: const Icon(Icons.edit_outlined),
                        label: const Text('Editar perfil'),
                      ),
                    ),
                  ],
                  ProfileTabs(
                    labels: labels,
                    currentIndex: tabIndex,
                    onChanged: (index) => setState(() {
                      // Selecting the opportunities/saved tab refetches, so a
                      // save made elsewhere (web, another screen) shows up
                      // without a pull-to-refresh.
                      if (index != _tabIndex && index >= 2) {
                        _refreshTick++;
                      }
                      _tabIndex = index;
                    }),
                  ),
                  switch (tabIndex) {
                    _postsTab => const ProfilePostsList(
                        emptyMessage: 'Voce ainda nao publicou nada.',
                      ),
                    1 => state.profile == null
                        ? const SizedBox.shrink()
                        : AboutProfile(profile: state.profile!),
                    _ => isCompany
                        ? CompanyOpportunitiesList(
                            companyId: state.profile!.id,
                            refreshTick: _refreshTick,
                          )
                        : SavedOpportunitiesList(refreshTick: _refreshTick),
                  },
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Future<void> _editProfile(BuildContext context, Profile profile) async {
    final cubit = context.read<ProfileCubit>();
    final saved = await Navigator.of(context).push<Profile>(
      MaterialPageRoute(builder: (_) => EditProfileScreen(profile: profile)),
    );
    if (saved != null) {
      // Reload so follower counts and anything the API normalized are in
      // sync, not only the fields the form sent.
      await cubit.loadMyProfile();
    }
  }

  void _showError(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}
