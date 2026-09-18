import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../domain/repositories/opportunity_repository.dart';
import '../cubit/company_opportunities_cubit.dart';
import 'opportunity_card.dart';

/// Opportunities published by a company, embedded in that company's profile
/// (own profile tab or `/profile/:userId`). It owns its cubit so both screens
/// just drop it in with a [companyId].
///
/// [refreshTick] is how the host screen asks for a reload: its pull-to-refresh
/// bumps the counter and this list fetches again, so an opportunity created
/// elsewhere shows up without leaving the profile.
///
/// An athlete viewer gets the same save and apply actions as the Opportunities
/// tab; a company viewer only sees the cards (those endpoints are athlete-only).
class CompanyOpportunitiesList extends StatefulWidget {
  const CompanyOpportunitiesList({
    required this.companyId,
    this.refreshTick = 0,
    super.key,
  });

  final int companyId;
  final int refreshTick;

  @override
  State<CompanyOpportunitiesList> createState() =>
      _CompanyOpportunitiesListState();
}

class _CompanyOpportunitiesListState extends State<CompanyOpportunitiesList> {
  late final CompanyOpportunitiesCubit _cubit;

  @override
  void initState() {
    super.initState();
    _cubit = CompanyOpportunitiesCubit(
      context.read<OpportunityRepository>(),
      companyId: widget.companyId,
    )..load();
  }

  @override
  void didUpdateWidget(covariant CompanyOpportunitiesList oldWidget) {
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
      child: BlocListener<CompanyOpportunitiesCubit, CompanyOpportunitiesState>(
        listenWhen: (_, current) => current.actionErrorMessage != null,
        listener: (context, state) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.actionErrorMessage!)),
          );
          context.read<CompanyOpportunitiesCubit>().dismissActionError();
        },
        child: const _CompanyOpportunitiesView(),
      ),
    );
  }
}

class _CompanyOpportunitiesView extends StatelessWidget {
  const _CompanyOpportunitiesView();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CompanyOpportunitiesCubit, CompanyOpportunitiesState>(
      builder: (context, state) {
        final isAthlete =
            context.read<AuthCubit>().state.user?.isCompany == false;
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
                  onPressed: context.read<CompanyOpportunitiesCubit>().load,
                  child: const Text('Tentar novamente'),
                ),
              ],
            ),
          );
        }
        if (state.opportunities.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(32),
            child: Center(
              child: Text(
                'Nenhuma oportunidade publicada ainda.',
                textAlign: TextAlign.center,
              ),
            ),
          );
        }

        final cubit = context.read<CompanyOpportunitiesCubit>();
        return Column(
          children: [
            for (final opportunity in state.opportunities)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: OpportunityCard(
                  opportunity: opportunity,
                  isPending: state.pendingIds.contains(opportunity.id),
                  onToggleSaved: isAthlete
                      ? () => cubit.toggleSaved(opportunityId: opportunity.id)
                      : null,
                  onToggleSubscription: isAthlete
                      ? () => cubit.toggleSubscription(
                            opportunityId: opportunity.id,
                          )
                      : null,
                  onOpenDetail: () => showOpportunityDetail(
                    context,
                    opportunity: opportunity,
                    onToggleSaved: isAthlete
                        ? () => cubit.toggleSaved(opportunityId: opportunity.id)
                        : null,
                    onToggleSubscription: isAthlete
                        ? () => cubit.toggleSubscription(
                              opportunityId: opportunity.id,
                            )
                        : null,
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
