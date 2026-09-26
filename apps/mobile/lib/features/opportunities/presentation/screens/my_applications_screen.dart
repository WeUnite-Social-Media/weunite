import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/repositories/opportunity_repository.dart';
import '../cubit/my_applications_cubit.dart';
import '../widgets/opportunity_card.dart';

/// "Minhas candidaturas" — the mobile counterpart of the web
/// `MyOpportunities` page for an athlete: every opportunity the signed-in
/// athlete applied to, sorted like the web (expired last, then soonest
/// deadline).
class MyApplicationsScreen extends StatelessWidget {
  const MyApplicationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) =>
          MyApplicationsCubit(context.read<OpportunityRepository>())..load(),
      child: const _MyApplicationsView(),
    );
  }
}

class _MyApplicationsView extends StatelessWidget {
  const _MyApplicationsView();

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<MyApplicationsCubit, MyApplicationsState>(
      listener: (context, state) {
        if (state.actionErrorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.actionErrorMessage!)),
          );
          context.read<MyApplicationsCubit>().dismissActionError();
        }
      },
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(
            title: Text(
              state.opportunities.isEmpty
                  ? 'Minhas candidaturas'
                  : 'Minhas candidaturas - ${state.opportunities.length}',
            ),
          ),
          body: _body(context, state),
        );
      },
    );
  }

  Widget _body(BuildContext context, MyApplicationsState state) {
    if (state.isLoading && !state.hasLoaded) {
      return const Center(child: CircularProgressIndicator());
    }
    if (state.loadErrorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(state.loadErrorMessage!, textAlign: TextAlign.center),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: context.read<MyApplicationsCubit>().load,
                child: const Text('Tentar novamente'),
              ),
            ],
          ),
        ),
      );
    }
    if (state.opportunities.isEmpty) {
      // Same wording as the web empty state.
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.how_to_reg_outlined, size: 72),
              const SizedBox(height: 16),
              Text(
                'Você ainda não se candidatou a nenhuma oportunidade',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Explore as oportunidades disponíveis e candidate-se às que '
                'combinam com você.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      );
    }

    final cubit = context.read<MyApplicationsCubit>();
    return RefreshIndicator(
      onRefresh: cubit.load,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: state.opportunities.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final opportunity = state.opportunities[index];
          return OpportunityCard(
            opportunity: opportunity,
            isPending: state.pendingIds.contains(opportunity.id),
            onToggleSaved: () =>
                cubit.toggleSaved(opportunityId: opportunity.id),
            onToggleSubscription: () =>
                cubit.toggleSubscription(opportunityId: opportunity.id),
            onOpenDetail: () => showOpportunityDetail(
              context,
              opportunity: opportunity,
              onToggleSaved: () =>
                  cubit.toggleSaved(opportunityId: opportunity.id),
              onToggleSubscription: () =>
                  cubit.toggleSubscription(opportunityId: opportunity.id),
              isPending: state.pendingIds.contains(opportunity.id),
            ),
          );
        },
      ),
    );
  }
}
