import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/repositories/opportunity_repository.dart';
import '../cubit/saved_opportunities_cubit.dart';
import 'opportunity_card.dart';

/// The "Salvos" tab of my own profile: the opportunities I saved, over the
/// same endpoint as the web "Oportunidades salvas" page.
///
/// [refreshTick] is bumped by the host screen's pull-to-refresh so the list
/// reloads without leaving the profile.
class SavedOpportunitiesList extends StatefulWidget {
  const SavedOpportunitiesList({this.refreshTick = 0, super.key});

  final int refreshTick;

  @override
  State<SavedOpportunitiesList> createState() => _SavedOpportunitiesListState();
}

class _SavedOpportunitiesListState extends State<SavedOpportunitiesList> {
  late final SavedOpportunitiesCubit _cubit;

  @override
  void initState() {
    super.initState();
    _cubit = SavedOpportunitiesCubit(context.read<OpportunityRepository>())
      ..load();
  }

  @override
  void didUpdateWidget(covariant SavedOpportunitiesList oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.refreshTick != widget.refreshTick) {
      _cubit.load();
    }
  }

  @override
  void dispose() {
    _cubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _cubit,
      child: BlocListener<SavedOpportunitiesCubit, SavedOpportunitiesState>(
        listenWhen: (_, current) => current.actionErrorMessage != null,
        listener: (context, state) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.actionErrorMessage!)),
          );
          context.read<SavedOpportunitiesCubit>().dismissActionError();
        },
        child: const _SavedOpportunitiesView(),
      ),
    );
  }
}

class _SavedOpportunitiesView extends StatelessWidget {
  const _SavedOpportunitiesView();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SavedOpportunitiesCubit, SavedOpportunitiesState>(
      builder: (context, state) {
        if (state.isLoading && !state.hasLoaded) {
          return const Padding(
            padding: EdgeInsets.all(32),
            child: Center(child: CircularProgressIndicator()),
          );
        }
        if (state.loadErrorMessage != null) {
          return Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              children: [
                Text(state.loadErrorMessage!, textAlign: TextAlign.center),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: context.read<SavedOpportunitiesCubit>().load,
                  child: const Text('Tentar novamente'),
                ),
              ],
            ),
          );
        }
        if (state.opportunities.isEmpty) {
          // Same wording as the web empty state.
          return const Padding(
            padding: EdgeInsets.all(32),
            child: Center(
              child: Text(
                'Nenhuma oportunidade salva ainda.',
                textAlign: TextAlign.center,
              ),
            ),
          );
        }

        final cubit = context.read<SavedOpportunitiesCubit>();
        return Column(
          children: [
            for (final opportunity in state.opportunities)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: OpportunityCard(
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
                ),
              ),
          ],
        );
      },
    );
  }
}
