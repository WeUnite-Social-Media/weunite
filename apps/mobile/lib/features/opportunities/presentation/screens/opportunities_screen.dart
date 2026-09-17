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
                return OpportunityCard(
                  opportunity: state.opportunities[index],
                );
              },
            ),
          ),
        );
      },
    );
  }
}
