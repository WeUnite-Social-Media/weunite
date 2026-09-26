import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

enum AppTab { feed, opportunities, chat, profile }

class AppBottomNav extends StatelessWidget {
  const AppBottomNav({
    required this.currentTab,
    required this.onTabSelected,
    this.chatUnreadCount = 0,
    super.key,
  });

  const AppBottomNav.withBadge({
    required this.currentTab,
    required this.onTabSelected,
    required this.chatUnreadCount,
    super.key,
  });

  final AppTab currentTab;
  final ValueChanged<AppTab> onTabSelected;

  /// Unread messages across every conversation. Comes from the chat state, not
  /// from a counter of its own, so it always agrees with the per-conversation
  /// badges in the Chat tab.
  final int chatUnreadCount;

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      selectedIndex: AppTab.values.indexOf(currentTab),
      height: 64,
      backgroundColor: AppColors.sidebar,
      indicatorColor: AppColors.accentGreen.withValues(alpha: 0.14),
      onDestinationSelected: (index) => onTabSelected(AppTab.values[index]),
      destinations: [
        const NavigationDestination(
          icon: Icon(Icons.home_outlined),
          selectedIcon: Icon(Icons.home, color: AppColors.accentGreen),
          label: 'Home',
        ),
        const NavigationDestination(
          icon: Icon(Icons.link_outlined),
          selectedIcon: Icon(Icons.link, color: AppColors.accentGreen),
          label: 'Oportunidade',
        ),
        NavigationDestination(
          icon: _ChatIcon(
            unreadCount: chatUnreadCount,
            icon: Icons.chat_bubble_outline,
          ),
          selectedIcon: _ChatIcon(
            unreadCount: chatUnreadCount,
            icon: Icons.chat_bubble,
            color: AppColors.accentGreen,
          ),
          label: 'Chat',
        ),
        const NavigationDestination(
          icon: Icon(Icons.person_outline),
          selectedIcon: Icon(Icons.person, color: AppColors.accentGreen),
          label: 'Perfil',
        ),
      ],
    );
  }
}

/// Chat icon with the unread badge. The count is capped at "9+", the same way
/// the web caps its sidebar badge.
class _ChatIcon extends StatelessWidget {
  const _ChatIcon({required this.unreadCount, required this.icon, this.color});

  final int unreadCount;
  final IconData icon;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final badge = Icon(icon, color: color);
    if (unreadCount <= 0) {
      return badge;
    }
    return Badge(
      label: Text(unreadCount > 9 ? '9+' : '$unreadCount'),
      backgroundColor: AppColors.destructive,
      textColor: Colors.white,
      child: badge,
    );
  }
}
