import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/opportunity.dart';
import '../../domain/repositories/opportunity_repository.dart';

part 'opportunities_state.dart';

class OpportunitiesCubit extends Cubit<OpportunitiesState> {
  OpportunitiesCubit(this._repository) : super(const OpportunitiesState());

  final OpportunityRepository _repository;

  Future<void> loadOpportunities() async {
    final hadOpportunities = state.opportunities.isNotEmpty;
    emit(
      state.copyWith(
        isLoading: !hadOpportunities,
        loadErrorMessage: () => null,
        actionErrorMessage: () => null,
      ),
    );
    try {
      final opportunities = await _repository.getOpportunities();
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          opportunities: opportunities,
        ),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          loadErrorMessage: hadOpportunities ? null : () => error.message,
          actionErrorMessage: hadOpportunities ? () => error.message : null,
        ),
      );
    }
  }

  /// Bookmarks or unbookmarks an opportunity. The card flips immediately and
  /// is then reconciled with what the API reports; a failure reverts it.
  Future<void> toggleSaved({required int opportunityId}) async {
    await _toggle(
      opportunityId: opportunityId,
      optimistic: (opportunity) =>
          opportunity.copyWith(isSaved: !opportunity.isSaved),
      call: () => _repository.toggleSaved(opportunityId: opportunityId),
      applyResult: (opportunity, saved) => opportunity.copyWith(isSaved: saved),
    );
  }

  /// Applies to (or withdraws from) an opportunity, keeping the applicant
  /// counter in sync.
  Future<void> toggleSubscription({required int opportunityId}) async {
    await _toggle(
      opportunityId: opportunityId,
      optimistic: (opportunity) => _withSubscription(
        opportunity,
        !opportunity.isSubscribed,
      ),
      call: () => _repository.toggleSubscription(opportunityId: opportunityId),
      applyResult: _withSubscription,
    );
  }

  Opportunity _withSubscription(Opportunity opportunity, bool subscribed) {
    if (subscribed == opportunity.isSubscribed) {
      return opportunity;
    }
    final next = subscribed
        ? opportunity.subscribersCount + 1
        : opportunity.subscribersCount - 1;
    return opportunity.copyWith(
      isSubscribed: subscribed,
      subscribersCount: next < 0 ? 0 : next,
    );
  }

  Future<void> _toggle({
    required int opportunityId,
    required Opportunity Function(Opportunity opportunity) optimistic,
    required Future<bool> Function() call,
    required Opportunity Function(Opportunity opportunity, bool result)
        applyResult,
  }) async {
    if (state.pendingIds.contains(opportunityId)) {
      return;
    }
    final previous = state.opportunities;
    if (!previous.any((opportunity) => opportunity.id == opportunityId)) {
      return;
    }

    emit(
      state.copyWith(
        opportunities: _map(previous, opportunityId, optimistic),
        pendingIds: {...state.pendingIds, opportunityId},
        actionErrorMessage: () => null,
      ),
    );
    try {
      final result = await call();
      emit(
        state.copyWith(
          opportunities: _map(
            previous,
            opportunityId,
            (opportunity) => applyResult(opportunity, result),
          ),
          pendingIds: {...state.pendingIds}..remove(opportunityId),
        ),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          opportunities: previous,
          pendingIds: {...state.pendingIds}..remove(opportunityId),
          actionErrorMessage: () => error.message,
        ),
      );
    }
  }

  List<Opportunity> _map(
    List<Opportunity> opportunities,
    int opportunityId,
    Opportunity Function(Opportunity opportunity) update,
  ) {
    return [
      for (final opportunity in opportunities)
        if (opportunity.id == opportunityId)
          update(opportunity)
        else
          opportunity,
    ];
  }

  void dismissActionError() {
    if (state.actionErrorMessage == null) {
      return;
    }
    emit(state.copyWith(actionErrorMessage: () => null));
  }
}
