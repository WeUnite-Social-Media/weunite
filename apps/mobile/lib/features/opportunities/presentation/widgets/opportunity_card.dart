import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/widgets/weunite_card.dart';
import '../../domain/entities/opportunity.dart';

class OpportunityCard extends StatelessWidget {
  const OpportunityCard({
    required this.opportunity,
    this.onTap,
    this.onSave,
    this.onApply,
    this.canApply = false,
    super.key,
  });

  final Opportunity opportunity;
  final VoidCallback? onTap;
  final VoidCallback? onSave;
  final VoidCallback? onApply;
  final bool canApply;

  @override
  Widget build(BuildContext context) {
    return WeUniteCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: CircleAvatar(
              backgroundImage: opportunity.companyAvatar == null
                  ? null
                  : NetworkImage(opportunity.companyAvatar!),
              child: opportunity.companyAvatar == null
                  ? Text(_initial(opportunity.companyName))
                  : null,
            ),
            title: Text(opportunity.title),
            subtitle: Text(opportunity.companyName),
            trailing: IconButton(
              onPressed: onSave,
              icon: Icon(
                opportunity.isSaved ? Icons.bookmark : Icons.bookmark_border,
              ),
            ),
          ),
          Text(
            opportunity.description,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: opportunity.skills
                .take(4)
                .map((skill) => Chip(label: Text(skill)))
                .toList(),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.calendar_today_outlined, size: 16),
              const SizedBox(width: 6),
              Text(DateFormat('dd/MM/yyyy').format(opportunity.dateEnd)),
              const Spacer(),
              Text('${opportunity.subscribersCount} inscritos'),
            ],
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: FilledButton(
              onPressed: canApply ? onApply : null,
              child: Text(
                opportunity.isSubscribed ? 'Inscrito' : 'Candidatar-se',
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _initial(String value) {
    return value.trim().isEmpty ? '?' : value.trim()[0].toUpperCase();
  }
}

class OpportunityDetailSheet extends StatelessWidget {
  const OpportunityDetailSheet({
    required this.opportunity,
    this.onApply,
    this.canApply = false,
    super.key,
  });

  final Opportunity opportunity;
  final VoidCallback? onApply;
  final bool canApply;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.72,
      maxChildSize: 0.92,
      builder: (context, controller) {
        return ListView(
          controller: controller,
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              opportunity.title,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(opportunity.companyName),
            const SizedBox(height: 16),
            Text(opportunity.description),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              children: opportunity.skills
                  .map((skill) => Chip(label: Text(skill)))
                  .toList(),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: canApply ? onApply : null,
              child: Text(
                opportunity.isSubscribed ? 'Inscrito' : 'Candidatar-se',
              ),
            ),
          ],
        );
      },
    );
  }
}
