import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/opportunity.dart';

/// "Oportunidades Sugestões" — a horizontal carousel above the main list,
/// mirroring apps/web's `OpportunitySuggestionCarousel`. It reuses whichever
/// opportunities the host screen already loaded: no separate request or
/// recommendation endpoint (the web component doesn't have one either).
class OpportunitySuggestionsCarousel extends StatelessWidget {
  const OpportunitySuggestionsCarousel({
    required this.opportunities,
    required this.onOpenDetail,
    super.key,
  });

  final List<Opportunity> opportunities;
  final void Function(Opportunity opportunity) onOpenDetail;

  @override
  Widget build(BuildContext context) {
    if (opportunities.isEmpty) {
      return const SizedBox.shrink();
    }
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Oportunidades Sugestões',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 168,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: opportunities.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final opportunity = opportunities[index];
                return _OpportunitySuggestionCard(
                  opportunity: opportunity,
                  onTap: () => onOpenDetail(opportunity),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _OpportunitySuggestionCard extends StatelessWidget {
  const _OpportunitySuggestionCard({
    required this.opportunity,
    required this.onTap,
  });

  final Opportunity opportunity;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 220,
      child: Card(
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 14,
                      backgroundImage: opportunity.companyAvatar == null
                          ? null
                          : NetworkImage(opportunity.companyAvatar!),
                      child: opportunity.companyAvatar == null
                          ? Text(
                              _initial(opportunity.companyName),
                              style: const TextStyle(fontSize: 12),
                            )
                          : null,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        opportunity.companyName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  opportunity.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context)
                      .textTheme
                      .titleSmall
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                if (opportunity.skills.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 4,
                    runSpacing: 4,
                    children: opportunity.skills
                        .take(2)
                        .map(
                          (skill) => Chip(
                            label: Text(
                              skill,
                              style: const TextStyle(fontSize: 10),
                            ),
                            visualDensity: VisualDensity.compact,
                            materialTapTargetSize:
                                MaterialTapTargetSize.shrinkWrap,
                            padding: EdgeInsets.zero,
                          ),
                        )
                        .toList(),
                  ),
                ],
                const Spacer(),
                if (opportunity.location != null &&
                    opportunity.location!.trim().isNotEmpty)
                  _MetaLine(
                    icon: Icons.place_outlined,
                    text: opportunity.location!,
                  ),
                _MetaLine(
                  icon: Icons.groups_outlined,
                  text: '${opportunity.subscribersCount} candidatos',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _initial(String value) {
    return value.trim().isEmpty ? '?' : value.trim()[0].toUpperCase();
  }
}

class _MetaLine extends StatelessWidget {
  const _MetaLine({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppColors.mutedForeground),
        const SizedBox(width: 4),
        Expanded(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: AppColors.mutedForeground),
          ),
        ),
      ],
    );
  }
}
