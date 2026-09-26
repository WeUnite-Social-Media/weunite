import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/widgets/async_state_view.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../domain/opportunity_filter.dart';
import '../cubit/opportunities_cubit.dart';
import '../widgets/opportunity_card.dart';
import '../widgets/opportunity_detail_route.dart';
import '../widgets/opportunity_suggestions_carousel.dart';

class OpportunitiesScreen extends StatefulWidget {
  const OpportunitiesScreen({super.key});

  @override
  State<OpportunitiesScreen> createState() => _OpportunitiesScreenState();
}

class _OpportunitiesScreenState extends State<OpportunitiesScreen> {
  final _searchController = TextEditingController();
  String _searchTerm = '';

  @override
  void initState() {
    super.initState();
    if (!context.read<OpportunitiesCubit>().state.hasLoaded) {
      context.read<OpportunitiesCubit>().loadOpportunities();
    }
    _searchController.addListener(() {
      setState(() => _searchTerm = _searchController.text);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
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
            child: Builder(
              builder: (context) {
                // Saving and applying are athlete-only on the API, so a
                // company account sees the listing without those actions.
                final isAthlete =
                    context.read<AuthCubit>().state.user?.isCompany == false;
                final isSearching = _searchTerm.trim().isNotEmpty;
                final visibleOpportunities = filterOpportunities(
                  state.opportunities,
                  _searchTerm,
                );
                // While searching, the suggestions carousel is hidden — same
                // rule as the web (`!isSearching && opportunities.length > 0`).
                final showsSuggestions =
                    !isSearching && state.opportunities.isNotEmpty;
                final showsEmptySearchMessage =
                    isSearching && visibleOpportunities.isEmpty;
                final headerCount = (showsSuggestions ? 1 : 0) +
                    (showsEmptySearchMessage ? 1 : 0);
                final itemCount = 1 + headerCount + visibleOpportunities.length;
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: itemCount,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    if (index == 0) {
                      return _OpportunitiesHeader(
                        controller: _searchController,
                        isAthlete: isAthlete,
                      );
                    }
                    var position = index - 1;
                    if (showsSuggestions) {
                      if (position == 0) {
                        return OpportunitySuggestionsCarousel(
                          opportunities: state.opportunities,
                          onOpenDetail: (opportunity) =>
                              showOpportunityDetailBound(
                            context,
                            opportunityId: opportunity.id,
                            canAct: isAthlete,
                          ),
                        );
                      }
                      position -= 1;
                    }
                    if (showsEmptySearchMessage) {
                      if (position == 0) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 24),
                          child: Text(
                            'Nenhuma oportunidade encontrada para '
                            '"${_searchController.text}".',
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        );
                      }
                      position -= 1;
                    }
                    final opportunity = visibleOpportunities[position];
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
                );
              },
            ),
          ),
        );
      },
    );
  }
}

/// Search field plus the "Minhas candidaturas" / "Oportunidades salvas"
/// entries — the mobile counterpart of the web's `OpportunitySearch` +
/// `HorizontalMenuOpportunity`, both athlete-only navigation shortcuts.
class _OpportunitiesHeader extends StatelessWidget {
  const _OpportunitiesHeader({
    required this.controller,
    required this.isAthlete,
  });

  final TextEditingController controller;
  final bool isAthlete;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'Buscar oportunidades...',
            prefixIcon: Icon(Icons.search),
          ),
        ),
        if (isAthlete) ...[
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                OutlinedButton.icon(
                  onPressed: () => context.push('/opportunities/applications'),
                  icon: const Icon(Icons.how_to_reg_outlined, size: 18),
                  label: const Text('Minhas candidaturas'),
                ),
                const SizedBox(width: 8),
                OutlinedButton.icon(
                  onPressed: () => context.push('/opportunities/saved'),
                  icon: const Icon(Icons.bookmark_outline, size: 18),
                  label: const Text('Oportunidades salvas'),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
