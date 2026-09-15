import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

enum AppTab { feed, opportunities, chat, profile }

class AppBottomNav extends StatelessWidget {
  const AppBottomNav({
    required this.currentTab,
    required this.onTabSelected,
    super.key,
  });

  final AppTab currentTab;
  final ValueChanged<AppTab> onTabSelected;

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      selectedIndex: AppTab.values.indexOf(currentTab),
      height: 64,
      backgroundColor: AppColors.sidebar,
      indicatorColor: AppColors.accentGreen.withValues(alpha: 0.14),
      onDestinationSelected: (index) => onTabSelected(AppTab.values[index]),
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.home_outlined),
          selectedIcon: Icon(Icons.home, color: AppColors.accentGreen),
          label: 'Home',
        ),
        NavigationDestination(
          icon: Icon(Icons.link_outlined),
          selectedIcon: Icon(Icons.link, color: AppColors.accentGreen),
          label: 'Oportunidade',
        ),
        NavigationDestination(
          icon: Icon(Icons.chat_bubble_outline),
          selectedIcon: Icon(Icons.chat_bubble, color: AppColors.accentGreen),
          label: 'Chat',
        ),
        NavigationDestination(
          icon: Icon(Icons.person_outline),
          selectedIcon: Icon(Icons.person, color: AppColors.accentGreen),
          label: 'Perfil',
        ),
      ],
    );
  }
}
