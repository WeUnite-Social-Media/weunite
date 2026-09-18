import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/opportunity.dart';
import '../../domain/repositories/opportunity_repository.dart';

part 'company_opportunities_state.dart';

/// Opportunities published by one company (`GET /opportunities/get/company/{id}`),
/// shown on that company's profile. An athlete viewer can save and apply right
/// here, the same way the web company profile behaves; the toggles mirror
/// [OpportunitiesCubit] (optimistic, reconciled with what the API reports).
class CompanyOpportunitiesCubit extends Cubit<CompanyOpportunitiesState> {
  CompanyOpportunitiesCubit(this._repository, {required this.companyId})
      : super(const CompanyOpportunitiesState());

  final OpportunityRepository _repository;
  final int companyId;

  /// Saves or unsaves, keeping what the API reports as the truth.
  Future<void> toggleSaved({required int opportunityId}) async {
    await _toggle(
      opportunityId: opportunityId,
      optimistic: (opportunity) =>
          opportunity.copyWith(isSaved: !opportunity.isSaved),
      call: () => _repository.toggleSaved(opportunityId: opportunityId),
      apply: (opportunity, result) => opportunity.copyWith(isSaved: result),
    );
  }

  /// Applies or withdraws, adjusting the applicant counter as the web does.
  Future<void> toggleSubscription({required int opportunityId}) async {
    await _toggle(
      opportunityId: opportunityId,
      optimistic: (opportunity) => _withSubscription(
        opportunity,
        isSubscribed: !opportunity.isSubscribed,
      ),
      call: () => _repository.toggleSubscription(opportunityId: opportunityId),
      apply: (opportunity, result) =>
          _withSubscription(opportunity, isSubscribed: result),
    );
  }

  Opportunity _withSubscription(
    Opportunity opportunity, {
    required bool isSubscribed,
  }) {
    if (opportunity.isSubscribed == isSubscribed) {
      return opportunity;
    }
    final count = opportunity.subscribersCount + (isSubscribed ? 1 : -1);
    return opportunity.copyWith(
      isSubscribed: isSubscribed,
      subscribersCount: count < 0 ? 0 : count,
    );
  }

  Future<void> _toggle({
    required int opportunityId,
    required Opportunity Function(Opportunity) optimistic,
    required Future<bool> Function() call,
    required Opportunity Function(Opportunity, bool) apply,
  }) async {
    final original = state.opportunities
        .where((opportunity) => opportunity.id == opportunityId)
        .firstOrNull;
    if (original == null || state.pendingIds.contains(opportunityId)) {
      return;
    }
    emit(
      state.copyWith(
        opportunities: _replace(optimistic(original)),
        pendingIds: {...state.pendingIds, opportunityId},
        actionErrorMessage: () => null,
      ),
    );
    try {
      final result = await call();
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          opportunities: _replace(apply(original, result)),
          pendingIds: _withoutPending(opportunityId),
        ),
      );
    } on AppException catch (error) {
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          opportunities: _replace(original),
          pendingIds: _withoutPending(opportunityId),
          actionErrorMessage: () => error.message,
        ),
      );
    }
  }

  List<Opportunity> _replace(Opportunity opportunity) {
    return state.opportunities
        .map((item) => item.id == opportunity.id ? opportunity : item)
        .toList();
  }

  Set<int> _withoutPending(int opportunityId) {
    return state.pendingIds.where((id) => id != opportunityId).toSet();
  }

  void dismissActionError() {
    if (state.actionErrorMessage == null) {
      return;
    }
    emit(state.copyWith(actionErrorMessage: () => null));
  }

  Future<void> load() async {
    emit(state.copyWith(isLoading: true, loadErrorMessage: () => null));
    try {
      final opportunities = await _repository.getCompanyOpportunities(
        companyId: companyId,
      );
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          opportunities: opportunities,
        ),
      );
    } on AppException catch (error) {
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          loadErrorMessage: () => error.message,
        ),
      );
    }
  }
}
