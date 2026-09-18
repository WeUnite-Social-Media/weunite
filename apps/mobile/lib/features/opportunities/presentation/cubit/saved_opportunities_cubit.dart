import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/opportunity.dart';
import '../../domain/repositories/opportunity_repository.dart';

part 'saved_opportunities_state.dart';

/// Opportunities the signed-in athlete saved — the mobile counterpart of the
/// web "Oportunidades salvas" page, over the same
/// `GET /saved-opportunities/athlete/{id}` endpoint.
///
/// Unsaving here drops the item from the list right away (the web page cannot
/// unsave at all; its bookmark is decorative), and applying is still possible,
/// so the buttons behave like they do everywhere else.
class SavedOpportunitiesCubit extends Cubit<SavedOpportunitiesState> {
  SavedOpportunitiesCubit(this._repository)
      : super(const SavedOpportunitiesState());

  final OpportunityRepository _repository;

  Future<void> load() async {
    emit(state.copyWith(isLoading: true, loadErrorMessage: () => null));
    try {
      final opportunities = await _repository.getSavedOpportunities();
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

  /// Unsaves and removes the card from this list. If the API reports it is
  /// still saved, the item comes back.
  Future<void> toggleSaved({required int opportunityId}) async {
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
      final isSaved = await _repository.toggleSaved(
        opportunityId: opportunityId,
      );
      if (isClosed) {
        return;
      }
      emit(
        state.copyWith(
          opportunities: isSaved
              ? _replace(original.copyWith(isSaved: true))
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

  Future<void> toggleSubscription({required int opportunityId}) async {
    final original = state.opportunities
        .where((opportunity) => opportunity.id == opportunityId)
        .firstOrNull;
    if (original == null || state.pendingIds.contains(opportunityId)) {
      return;
    }
    emit(
      state.copyWith(
        opportunities: _replace(
          _withSubscription(original, isSubscribed: !original.isSubscribed),
        ),
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
          opportunities: _replace(
            _withSubscription(original, isSubscribed: isSubscribed),
          ),
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
