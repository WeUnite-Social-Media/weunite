import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/widgets/async_state_view.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../cubit/opportunities_cubit.dart';
import '../widgets/create_opportunity_sheet.dart';
import '../widgets/opportunity_card.dart';

class OpportunitiesScreen extends StatefulWidget {
  const OpportunitiesScreen({super.key});

  @override
  State<OpportunitiesScreen> createState() => _OpportunitiesScreenState();
}

class _OpportunitiesScreenState extends State<OpportunitiesScreen> {
  static const _filters = ['Todas', 'Futebol', 'Marketing', 'Patrocinio'];

  @override
  void initState() {
    super.initState();
    context.read<OpportunitiesCubit>().loadOpportunities();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OpportunitiesCubit, OpportunitiesState>(
      builder: (context, state) {
        final user = context.read<AuthCubit>().state.user;
        return BlocListener<OpportunitiesCubit, OpportunitiesState>(
          listener: (context, state) {
            final message = state.errorMessage ?? state.successMessage;
            if (message != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(message)),
              );
            }
          },
          child: Scaffold(
            body: AsyncStateView(
              isLoading: state.isLoading,
              errorMessage: state.errorMessage,
              onRetry: context.read<OpportunitiesCubit>().loadOpportunities,
              child: RefreshIndicator(
                onRefresh: context.read<OpportunitiesCubit>().loadOpportunities,
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: state.opportunities.length + 1,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    if (index == 0) {
                      return Wrap(
                        spacing: 8,
                        children: _filters.map((filter) {
                          final skill = filter == 'Todas' ? null : filter;
                          return ChoiceChip(
                            label: Text(filter),
                            selected: state.selectedSkill == skill,
                            onSelected: (_) => context
                                .read<OpportunitiesCubit>()
                                .loadOpportunities(skill: skill),
                          );
                        }).toList(),
                      );
                    }

                    final opportunity = state.opportunities[index - 1];
                    final canApply = user != null && !user.isCompany;
                    return OpportunityCard(
                      opportunity: opportunity,
                      canApply: canApply,
                      onTap: () => _openDetail(context, opportunity.id),
                      onSave: user == null || user.isCompany
                          ? null
                          : () =>
                              context.read<OpportunitiesCubit>().toggleSaved(
                                    athleteId: user.id,
                                    opportunityId: opportunity.id,
                                  ),
                      onApply: canApply
                          ? () => context
                              .read<OpportunitiesCubit>()
                              .toggleSubscription(
                                athleteId: user.id,
                                opportunityId: opportunity.id,
                              )
                          : null,
                    );
                  },
                ),
              ),
            ),
            floatingActionButton: user?.isCompany == true
                ? FloatingActionButton(
                    onPressed: () => showModalBottomSheet<void>(
                      context: context,
                      isScrollControlled: true,
                      builder: (_) => CreateOpportunitySheet(
                        companyId: user!.id,
                      ),
                    ),
                    child: const Icon(Icons.add_business),
                  )
                : null,
          ),
        );
      },
    );
  }

  Future<void> _openDetail(BuildContext context, int opportunityId) async {
    final cubit = context.read<OpportunitiesCubit>();
    await cubit.loadOpportunityDetail(opportunityId: opportunityId);

    if (!context.mounted) {
      return;
    }

    final user = context.read<AuthCubit>().state.user;
    final opportunity = cubit.state.selectedOpportunity;
    if (opportunity == null) {
      return;
    }

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => OpportunityDetailSheet(
        opportunity: opportunity,
        canApply: user != null && !user.isCompany,
        onApply: user == null || user.isCompany
            ? null
            : () => context.read<OpportunitiesCubit>().toggleSubscription(
                  athleteId: user.id,
                  opportunityId: opportunity.id,
                ),
      ),
    );
  }
}
