import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/widgets/async_state_view.dart';
import '../cubit/opportunities_cubit.dart';
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
        return AsyncStateView(
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

                return OpportunityCard(opportunity: state.opportunities[index - 1]);
              },
            ),
          ),
        );
      },
    );
  }
}
