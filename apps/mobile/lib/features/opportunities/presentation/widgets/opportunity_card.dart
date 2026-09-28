import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/time_ago.dart';
import '../../../../core/widgets/weunite_card.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../../profile/presentation/navigation/open_user_profile.dart';
import '../../../reporting/domain/entities/report_entity_type.dart';
import '../../../reporting/presentation/widgets/report_sheet.dart';
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
    // Display-only decision (whether the three-dot menu is shown), the same
    // pattern `PostCard` uses: the id is never forwarded to a repository/API
    // call from here.
    final currentUserId = context.watch<AuthCubit>().state.user?.id;
    final isOwner =
        opportunity.companyId != null && opportunity.companyId == currentUserId;
    return WeUniteCard(
      onTap: onOpenDetail ??
          () => showOpportunityDetail(context, opportunity: opportunity),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _OpportunityHeader(opportunity: opportunity, isOwner: isOwner),
          const SizedBox(height: 12),
          Text(
            opportunity.title,
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
          if (opportunity.description != null) ...[
            const SizedBox(height: 4),
            Text(
              opportunity.description!,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ],
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
          _OpportunityMetaRow(opportunity: opportunity),
          if (onToggleSubscription != null || onToggleSaved != null) ...[
            const SizedBox(height: 12),
            // `Expanded` instead of a `Spacer`: with the spacer this row made
            // the whole Opportunities list paint nothing on a device — header,
            // suggestions and every card disappeared, with no exception in the
            // log and the data already loaded. Giving the apply button the
            // leftover width explicitly, and letting the bookmark keep its
            // intrinsic size, fixes it. Same shape as the fix the report sheet
            // needed for its action row.
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (onToggleSubscription != null)
                  Flexible(
                    child: SubscribeButton(
                      opportunity: opportunity,
                      isPending: isPending,
                      onPressed: onToggleSubscription,
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
          ],
          // The web's owning company sees "Ver inscritos (N)" here, opening a
          // subscribers screen. Mobile has no such screen yet (see
          // PROGRESS.md pendencias), so the owner's footer stays empty rather
          // than showing an action that goes nowhere.
        ],
      ),
    );
  }
}

class _OpportunityHeader extends StatelessWidget {
  const _OpportunityHeader({required this.opportunity, required this.isOwner});

  final Opportunity opportunity;
  final bool isOwner;

  @override
  Widget build(BuildContext context) {
    final companyLabel = opportunity.companyUsername?.trim().isNotEmpty == true
        ? opportunity.companyUsername!
        : opportunity.companyName;
    final createdAt = opportunity.createdAt;
    final updatedAt = opportunity.updatedAt;
    final showsUpdated = createdAt != null &&
        updatedAt != null &&
        updatedAt.difference(createdAt).abs() > const Duration(seconds: 1);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GestureDetector(
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
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GestureDetector(
                onTap: () => openUserProfile(context, opportunity.companyId),
                child: Text(
                  companyLabel,
                  style: Theme.of(context)
                      .textTheme
                      .titleSmall
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
              ),
              if (createdAt != null)
                Text(
                  showsUpdated
                      ? 'ha ${timeAgo(createdAt)} · Atualizado há '
                          '${timeAgo(updatedAt)}'
                      : 'ha ${timeAgo(createdAt)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.mutedForeground,
                      ),
                ),
            ],
          ),
        ),
        if (!isOwner) _OpportunityMenuButton(opportunity: opportunity),
        // The web's owning company also gets "Editar"/"Excluir" here; mobile
        // has neither flow yet (see PROGRESS.md pendencias), so the owner
        // gets no menu at all instead of a partial one.
      ],
    );
  }

  String _initial(String value) {
    return value.trim().isEmpty ? '?' : value.trim()[0].toUpperCase();
  }
}

enum _OpportunityMenuAction { report }

class _OpportunityMenuButton extends StatelessWidget {
  const _OpportunityMenuButton({required this.opportunity});

  final Opportunity opportunity;

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<_OpportunityMenuAction>(
      icon: const Icon(Icons.more_vert),
      onSelected: (action) => _onMenuAction(context, action),
      itemBuilder: (context) => const [
        PopupMenuItem<_OpportunityMenuAction>(
          value: _OpportunityMenuAction.report,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.flag_outlined, color: AppColors.destructive),
              SizedBox(width: 8),
              Text('Denunciar', style: TextStyle(color: AppColors.destructive)),
            ],
          ),
        ),
      ],
    );
  }

  void _onMenuAction(BuildContext context, _OpportunityMenuAction action) {
    switch (action) {
      case _OpportunityMenuAction.report:
        showReportSheet(
          context,
          type: ReportEntityType.opportunity,
          entityId: opportunity.id,
          entityTitle: opportunity.title,
        );
    }
  }
}

class _OpportunityMetaRow extends StatelessWidget {
  const _OpportunityMetaRow({required this.opportunity});

  final Opportunity opportunity;

  @override
  Widget build(BuildContext context) {
    final mutedStyle = Theme.of(context)
        .textTheme
        .bodySmall
        ?.copyWith(color: AppColors.mutedForeground);
    return Wrap(
      spacing: 16,
      runSpacing: 4,
      children: [
        if (opportunity.location != null &&
            opportunity.location!.trim().isNotEmpty)
          _MetaItem(
            icon: Icons.place_outlined,
            text: opportunity.location!,
            style: mutedStyle,
          ),
        _MetaItem(
          icon: Icons.calendar_today_outlined,
          text: 'Ate ${formatOpportunityDate(opportunity.dateEnd)}',
          style: mutedStyle,
        ),
        _MetaItem(
          icon: Icons.groups_outlined,
          text: '${opportunity.subscribersCount} candidatos',
          style: mutedStyle,
        ),
      ],
    );
  }
}

class _MetaItem extends StatelessWidget {
  const _MetaItem({required this.icon, required this.text, this.style});

  final IconData icon;
  final String text;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: AppColors.mutedForeground),
        const SizedBox(width: 6),
        Text(text, style: style),
      ],
    );
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
    final currentUserId = context.watch<AuthCubit>().state.user?.id;
    final isOwner =
        opportunity.companyId != null && opportunity.companyId == currentUserId;
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.75,
      maxChildSize: 0.95,
      builder: (context, controller) {
        return Column(
          children: [
            Expanded(
              child: _details(
                context,
                controller,
                closed: closed,
                isOwner: isOwner,
              ),
            ),
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
    required bool isOwner,
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
            if (!isOwner) _OpportunityMenuButton(opportunity: opportunity),
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
