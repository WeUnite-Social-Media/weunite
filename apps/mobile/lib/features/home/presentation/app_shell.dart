import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_bottom_nav.dart';
import '../../auth/presentation/cubit/auth_cubit.dart';
import '../../chat/presentation/screens/conversations_screen.dart';
import '../../feed/presentation/screens/feed_screen.dart';
import '../../opportunities/presentation/screens/opportunities_screen.dart';
import '../../profile/presentation/screens/profile_screen.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  AppTab _currentTab = AppTab.feed;

  Widget get _screen {
    return switch (_currentTab) {
      AppTab.feed => const FeedScreen(),
      AppTab.opportunities => const OpportunitiesScreen(),
      AppTab.chat => const ConversationsScreen(),
      AppTab.profile => const ProfileScreen(),
    };
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const _BrandTitle(),
        actions: [
          IconButton(
            tooltip: 'Sair',
            onPressed: context.read<AuthCubit>().logout,
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: _screen,
      bottomNavigationBar: AppBottomNav(
        currentTab: _currentTab,
        onTabSelected: (tab) => setState(() => _currentTab = tab),
      ),
    );
  }
}

class _BrandTitle extends StatelessWidget {
  const _BrandTitle();

  @override
  Widget build(BuildContext context) {
    return const Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: 'We',
            style: TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.w800,
            ),
          ),
          TextSpan(
            text: 'Unite',
            style: TextStyle(
              color: AppColors.accentGreen,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
