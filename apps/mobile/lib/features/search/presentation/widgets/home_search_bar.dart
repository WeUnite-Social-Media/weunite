import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';

/// Search bar shown at the top of the Home feed. It is a button, not a field:
/// tapping it pushes `/search`, which owns the input and the results.
class HomeSearchBar extends StatelessWidget {
  const HomeSearchBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () => context.push('/search'),
        child: Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              const Icon(Icons.search, color: AppColors.mutedForeground),
              const SizedBox(width: 8),
              Text(
                'Pesquisar',
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(color: AppColors.mutedForeground),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
