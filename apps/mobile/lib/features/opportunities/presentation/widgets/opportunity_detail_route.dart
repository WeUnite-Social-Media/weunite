import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../cubit/opportunities_cubit.dart';
import 'opportunity_card.dart';

/// Opens the opportunity detail bound to [OpportunitiesCubit]: the sheet
/// rebuilds from the cubit state, so saving or applying inside it updates the
/// buttons (and the card behind it) right away.
Future<void> showOpportunityDetailBound(
  BuildContext context, {
  required int opportunityId,
  required bool canAct,
}) {
  final cubit = context.read<OpportunitiesCubit>();
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (_) => BlocProvider.value(
      value: cubit,
      child: BlocBuilder<OpportunitiesCubit, OpportunitiesState>(
        builder: (context, state) {
          final opportunity = state.opportunities
              .where((item) => item.id == opportunityId)
              .firstOrNull;
          if (opportunity == null) {
            return const SizedBox.shrink();
          }
          return OpportunityDetailSheet(
            opportunity: opportunity,
            isPending: state.pendingIds.contains(opportunityId),
            onToggleSaved: canAct
                ? () => context
                    .read<OpportunitiesCubit>()
                    .toggleSaved(opportunityId: opportunityId)
                : null,
            onToggleSubscription: canAct
                ? () => context
                    .read<OpportunitiesCubit>()
                    .toggleSubscription(opportunityId: opportunityId)
                : null,
          );
        },
      ),
    ),
  );
}
