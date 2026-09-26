import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

/// The profile tab bar. Extracted from `ProfileScreen` so my own profile and
/// another user's profile show the same thing, the way the web `FeedProfile`
/// uses one tab component for every profile.
class ProfileTabs extends StatelessWidget {
  const ProfileTabs({
    required this.labels,
    required this.currentIndex,
    required this.onChanged,
    super.key,
  });

  final List<String> labels;
  final int currentIndex;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: labels.length,
      initialIndex: currentIndex < labels.length ? currentIndex : 0,
      child: TabBar(
        labelColor: AppColors.primary,
        indicatorColor: AppColors.accentGreen,
        onTap: onChanged,
        tabs: [for (final label in labels) Tab(text: label)],
      ),
    );
  }
}
