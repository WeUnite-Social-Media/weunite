import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_bottom_nav.dart';
import '../../auth/presentation/cubit/auth_cubit.dart';
import '../../chat/presentation/cubit/chat_cubit.dart';

/// Hosts the four bottom-nav tabs as branches of a
/// `StatefulShellRoute.indexedStack` (see `lib/app/router.dart`): each
/// branch keeps its own `Navigator` and screen state alive when switching
/// tabs, the same way the previous manual `IndexedStack` did.
class AppShell extends StatelessWidget {
  const AppShell({required this.navigationShell, super.key});

  final StatefulNavigationShell navigationShell;

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
      body: navigationShell,
      bottomNavigationBar: AppBottomNav(
        // Single source of truth: the same ChatCubit state that draws the
        // per-conversation badges, kept live by its STOMP subscriptions.
        chatUnreadCount: context.select(
          (ChatCubit cubit) => cubit.state.totalUnreadCount,
        ),
        currentTab: AppTab.values[navigationShell.currentIndex],
        onTabSelected: (tab) {
          final index = AppTab.values.indexOf(tab);
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
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
