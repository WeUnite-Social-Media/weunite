import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/weunite_card.dart';
import '../../../profile/presentation/navigation/open_user_profile.dart';
import '../../domain/entities/opportunity.dart';

/// One opportunity in a list. [onToggleSaved]/[onToggleSubscription] are only
/// provided where a cubit owns the list (the Opportunities tab); elsewhere
/// (e.g. search results) the card is read-only.
class OpportunityCard extends StatelessWidget {
  const OpportunityCard({
    required this.opportunity,
    this.onToggleSaved,
    this.onToggleSubscription,
    this.onOpenDetail,
    this.isPending = false,
    super.key,
  });

  final Opportunity opportunity;
  final VoidCallback? onToggleSaved;
  final VoidCallback? onToggleSubscription;

  /// Opens the detail sheet. Lists owned by a cubit pass a builder that keeps
  /// the sheet bound to the cubit state (so the buttons react to the result);
  /// without it the sheet shows this snapshot, read-only.
  final VoidCallback? onOpenDetail;
  final bool isPending;

  @override
  Widget build(BuildContext context) {
    return WeUniteCard(
      onTap: onOpenDetail ??
          () => showOpportunityDetail(context, opportunity: opportunity),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: GestureDetector(
              onTap: () => openUserProfile(context, opportunity.companyId),
              child: CircleAvatar(
                backgroundImage: opportunity.companyAvatar == null
                    ? null
                    : NetworkImage(opportunity.companyAvatar!),
                child: opportunity.companyAvatar == null
                    ? Text(_initial(opportunity.companyName))
                    : null,
              ),
            ),
            title: Text(opportunity.title),
            subtitle: GestureDetector(
              onTap: () => openUserProfile(context, opportunity.companyId),
              child: Text(opportunity.companyName),
            ),
            trailing: onToggleSaved == null
                ? null
                : _SaveButton(
                    isSaved: opportunity.isSaved,
                    isPending: isPending,
                    onPressed: onToggleSaved,
                  ),
          ),
          if (opportunity.description != null)
            Text(
              opportunity.description!,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          if (opportunity.skills.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: opportunity.skills
                  .take(4)
                  .map((skill) => Chip(label: Text(skill)))
                  .toList(),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.calendar_today_outlined, size: 16),
              const SizedBox(width: 6),
              Text(formatOpportunityDate(opportunity.dateEnd)),
              const Spacer(),
              if (opportunity.isSubscribed) ...[
                const Icon(
                  Icons.check_circle,
                  size: 16,
                  color: AppColors.accentGreenStrong,
                ),
                const SizedBox(width: 4),
              ],
              Text('${opportunity.subscribersCount} inscritos'),
            ],
          ),
          if (onToggleSubscription != null) ...[
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: SubscribeButton(
                opportunity: opportunity,
                isPending: isPending,
                onPressed: onToggleSubscription,
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _initial(String value) {
    return value.trim().isEmpty ? '?' : value.trim()[0].toUpperCase();
  }
}

String formatOpportunityDate(DateTime date) {
  return DateFormat('dd/MM/yyyy').format(date);
}

/// Whether the application deadline has passed (compared by day).
bool isOpportunityClosed(DateTime dateEnd, {DateTime? now}) {
  final today = now ?? DateTime.now();
  final endOfDay = DateTime(dateEnd.year, dateEnd.month, dateEnd.day, 23, 59);
  return endOfDay.isBefore(today);
}

/// Apply / withdraw button. Labels follow the web card: "Candidatar-se",
/// "Cancelar candidatura", "Prazo encerrado" (disabled) and "Processando...".
class SubscribeButton extends StatelessWidget {
  const SubscribeButton({
    required this.opportunity,
    required this.isPending,
    required this.onPressed,
    super.key,
  });

  final Opportunity opportunity;
  final bool isPending;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final closed = isOpportunityClosed(opportunity.dateEnd);
    final subscribed = opportunity.isSubscribed;
    // An applicant can always withdraw, even after the deadline — same rule
    // the web uses (`isSubscriptionClosed = !isSubscribed && isExpired`).
    final blocked = closed && !subscribed;
    final label = isPending
        ? 'Processando...'
        : subscribed
            ? 'Cancelar candidatura'
            : blocked
                ? 'Prazo encerrado'
                : 'Candidatar-se';

    if (subscribed) {
      return OutlinedButton.icon(
        onPressed: isPending ? null : onPressed,
        icon: const Icon(Icons.check_circle_outline, size: 18),
        label: Text(label),
      );
    }
    return ElevatedButton(
      onPressed: isPending || blocked ? null : onPressed,
      child: Text(label),
    );
  }
}

class _SaveButton extends StatelessWidget {
  const _SaveButton({
    required this.isSaved,
    required this.isPending,
    required this.onPressed,
  });

  final bool isSaved;
  final bool isPending;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      tooltip: isSaved ? 'Remover dos salvos' : 'Salvar oportunidade',
      onPressed: isPending ? null : onPressed,
      icon: isPending
          ? const SizedBox.square(
              dimension: 18,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : Icon(
              isSaved ? Icons.bookmark : Icons.bookmark_border,
              color: isSaved ? AppColors.accentGreenStrong : null,
            ),
    );
  }
}

/// Full details of an opportunity, with the actions when they are available.
Future<void> showOpportunityDetail(
  BuildContext context, {
  required Opportunity opportunity,
  VoidCallback? onToggleSaved,
  VoidCallback? onToggleSubscription,
  bool isPending = false,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (_) => OpportunityDetailSheet(
      opportunity: opportunity,
      onToggleSaved: onToggleSaved,
      onToggleSubscription: onToggleSubscription,
      isPending: isPending,
    ),
  );
}

class OpportunityDetailSheet extends StatelessWidget {
  const OpportunityDetailSheet({
    required this.opportunity,
    this.onToggleSaved,
    this.onToggleSubscription,
    this.isPending = false,
    super.key,
  });

  final Opportunity opportunity;
  final VoidCallback? onToggleSaved;
  final VoidCallback? onToggleSubscription;
  final bool isPending;

  @override
  Widget build(BuildContext context) {
    final closed = isOpportunityClosed(opportunity.dateEnd);
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.75,
      maxChildSize: 0.95,
      builder: (context, controller) {
        return Column(
          children: [
            Expanded(child: _details(context, controller, closed: closed)),
            // Pinned: on a phone the action used to sit below the fold and
            // looked missing until you scrolled.
            if (onToggleSubscription != null)
              SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
                  child: SizedBox(
                    width: double.infinity,
                    child: SubscribeButton(
                      opportunity: opportunity,
                      isPending: isPending,
                      onPressed: onToggleSubscription,
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _details(
    BuildContext context,
    ScrollController controller, {
    required bool closed,
  }) {
    return ListView(
      controller: controller,
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      children: [
        Center(
          child: Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: Theme.of(context).dividerColor,
              borderRadius: BorderRadius.circular(999),
            ),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: Text(
                opportunity.title,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
            ),
            if (onToggleSaved != null)
              _SaveButton(
                isSaved: opportunity.isSaved,
                isPending: isPending,
                onPressed: onToggleSaved,
              ),
          ],
        ),
        const SizedBox(height: 4),
        Chip(
          label: Text(closed ? 'Encerrada' : 'Aberta'),
          backgroundColor: closed ? AppColors.muted : null,
        ),
        const SizedBox(height: 16),
        ListTile(
          contentPadding: EdgeInsets.zero,
          onTap: () => openUserProfile(
            context,
            opportunity.companyId,
            closeCurrentRoute: true,
          ),
          leading: CircleAvatar(
            backgroundImage: opportunity.companyAvatar == null
                ? null
                : NetworkImage(opportunity.companyAvatar!),
            child: opportunity.companyAvatar == null
                ? Text(
                    opportunity.companyName.trim().isEmpty
                        ? '?'
                        : opportunity.companyName.trim()[0].toUpperCase(),
                  )
                : null,
          ),
          title: Text(opportunity.companyName),
          subtitle: const Text('Empresa responsavel'),
          trailing: const Icon(Icons.chevron_right),
        ),
        const Divider(height: 32),
        if (opportunity.description != null &&
            opportunity.description!.trim().isNotEmpty) ...[
          Text('Descricao', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Text(opportunity.description!),
          const SizedBox(height: 20),
        ],
        if (opportunity.skills.isNotEmpty) ...[
          Text(
            'Habilidades',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: opportunity.skills
                .map((skill) => Chip(label: Text(skill)))
                .toList(),
          ),
          const SizedBox(height: 20),
        ],
        Text('Informacoes', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        if (opportunity.location != null &&
            opportunity.location!.trim().isNotEmpty)
          _InfoRow(
            icon: Icons.place_outlined,
            label: 'Local',
            value: opportunity.location!,
          ),
        _InfoRow(
          icon: Icons.event_outlined,
          label: 'Inscricoes ate',
          value: formatOpportunityDate(opportunity.dateEnd),
        ),
        if (opportunity.createdAt != null)
          _InfoRow(
            icon: Icons.schedule_outlined,
            label: 'Publicada em',
            value: formatOpportunityDate(opportunity.createdAt!),
          ),
        _InfoRow(
          icon: Icons.groups_outlined,
          label: 'Candidatos',
          value: '${opportunity.subscribersCount}',
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.mutedForeground),
          const SizedBox(width: 10),
          Text('$label: ', style: Theme.of(context).textTheme.labelLarge),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
