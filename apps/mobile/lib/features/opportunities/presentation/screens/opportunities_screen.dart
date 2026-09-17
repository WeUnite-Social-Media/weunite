import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/widgets/async_state_view.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../cubit/opportunities_cubit.dart';
import '../widgets/opportunity_card.dart';
import '../widgets/opportunity_detail_route.dart';

class OpportunitiesScreen extends StatefulWidget {
  const OpportunitiesScreen({super.key});

  @override
  State<OpportunitiesScreen> createState() => _OpportunitiesScreenState();
}

class _OpportunitiesScreenState extends State<OpportunitiesScreen> {
  @override
  void initState() {
    super.initState();
    if (!context.read<OpportunitiesCubit>().state.hasLoaded) {
      context.read<OpportunitiesCubit>().loadOpportunities();
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<OpportunitiesCubit, OpportunitiesState>(
      listener: (context, state) {
        if (state.actionErrorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.actionErrorMessage!)),
          );
          context.read<OpportunitiesCubit>().dismissActionError();
        }
      },
      builder: (context, state) {
        return AsyncStateView(
          isLoading: state.isLoading,
          errorMessage: state.loadErrorMessage,
          onRetry: context.read<OpportunitiesCubit>().loadOpportunities,
          child: RefreshIndicator(
            onRefresh: context.read<OpportunitiesCubit>().loadOpportunities,
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: state.opportunities.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final opportunity = state.opportunities[index];
                // Saving and applying are athlete-only on the API, so a
                // company account sees the listing without those actions.
                final isAthlete =
                    context.read<AuthCubit>().state.user?.isCompany == false;
                return OpportunityCard(
                  opportunity: opportunity,
                  isPending: state.pendingIds.contains(opportunity.id),
                  onOpenDetail: () => showOpportunityDetailBound(
                    context,
                    opportunityId: opportunity.id,
                    canAct: isAthlete,
                  ),
                  onToggleSaved: isAthlete
                      ? () => context
                          .read<OpportunitiesCubit>()
                          .toggleSaved(opportunityId: opportunity.id)
                      : null,
                  onToggleSubscription: isAthlete
                      ? () => context
                          .read<OpportunitiesCubit>()
                          .toggleSubscription(opportunityId: opportunity.id)
                      : null,
                );
              },
            ),
          ),
        );
      },
    );
  }
}
