import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/opportunity.dart';
import '../../domain/opportunity_sort.dart';
import '../../domain/repositories/opportunity_repository.dart';

part 'my_applications_state.dart';

/// Opportunities the signed-in athlete applied to — the mobile counterpart of
/// the web "Minhas candidaturas" page, over the same
/// `GET /subscriber/athlete/{id}` endpoint `getMySubscriptions` already
/// calls, sorted the same way the web does
/// (`compareOpportunityDeadlineAsc`: expired last, then soonest deadline).
///
/// Cancelling an application drops the item from the list right away (there
/// is nothing left to show once it is no longer an application); if the API
/// still reports it applied, the item comes back.
class MyApplicationsCubit extends Cubit<MyApplicationsState> {
  MyApplicationsCubit(this._repository) : super(const MyApplicationsState());

  final OpportunityRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(isLoading: true, loadErrorMessage: () => null));
    try {
      final opportunities = await _repository.getMySubscriptions();
      if (isClosed) {
        return;
      }
      final sorted = [...opportunities]..sort(compareOpportunityDeadlineAsc);
      emit(
        state.copyWith(
          isLoading: false,
          hasLoaded: true,
          opportunities: sorted,
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

  Future<void> toggleSaved({required int opportunityId}) async {
    final original = state.opportunities
        .where((opportunity) => opportunity.id == opportunityId)
        .firstOrNull;
    if (original == null || state.pendingIds.contains(opportunityId)) {
      return;
    }
    emit(
      state.copyWith(
        opportunities: _replace(original.copyWith(isSaved: !original.isSaved)),
        pendingIds: {...state.pendingIds, opportunityId},
        actionErrorMessage: () => null,
      ),
    );
    try {
      final isSaved = await _repository.toggleSaved(
        opportunityId: opportunityId,
      );
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          opportunities: _replace(original.copyWith(isSaved: isSaved)),
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

  /// Cancels the application and removes the card from this list. If the
  /// API reports it is still subscribed, the item comes back.
  Future<void> toggleSubscription({required int opportunityId}) async {
    final original = state.opportunities
        .where((opportunity) => opportunity.id == opportunityId)
        .firstOrNull;
    if (original == null || state.pendingIds.contains(opportunityId)) {
      return;
    }
    emit(
      state.copyWith(
        pendingIds: {...state.pendingIds, opportunityId},
        actionErrorMessage: () => null,
      ),
    );
    try {
      final isSubscribed = await _repository.toggleSubscription(
        opportunityId: opportunityId,
      );
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          opportunities: isSubscribed
              ? _replace(original.copyWith(isSubscribed: true))
              : state.opportunities
                  .where((opportunity) => opportunity.id != opportunityId)
                  .toList(),
          pendingIds: _withoutPending(opportunityId),
        ),
      );
    } on AppException catch (error) {
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
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
}
