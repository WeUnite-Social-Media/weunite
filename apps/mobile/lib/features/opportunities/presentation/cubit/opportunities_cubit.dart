import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/opportunity.dart';
import '../../domain/repositories/opportunity_repository.dart';

part 'opportunities_state.dart';

class OpportunitiesCubit extends Cubit<OpportunitiesState> {
  OpportunitiesCubit(this._repository) : super(const OpportunitiesState());

  final OpportunityRepository _repository;

  Future<void> loadOpportunities({String? skill}) async {
    emit(
      state.copyWith(
        isLoading: true,
        selectedSkill: skill,
        errorMessage: null,
        successMessage: null,
      ),
    );
    try {
      final opportunities = await _repository.getOpportunities(skill: skill);
      emit(state.copyWith(isLoading: false, opportunities: opportunities));
    } on AppException catch (error) {
      emit(state.copyWith(isLoading: false, errorMessage: error.message));
    }
  }

  Future<void> loadOpportunityDetail({required int opportunityId}) async {
    emit(
      state.copyWith(
        isDetailLoading: true,
        errorMessage: null,
        successMessage: null,
      ),
    );
    try {
      final opportunity = await _repository.getOpportunity(
        opportunityId: opportunityId,
      );
      emit(
        state.copyWith(
          isDetailLoading: false,
          selectedOpportunity: _mergeLocalState(opportunity),
        ),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          isDetailLoading: false,
          errorMessage: error.message,
        ),
      );
    }
  }

  Future<void> createOpportunity({
    required int companyId,
    required String title,
    required String description,
    required String location,
    required DateTime dateEnd,
    required List<String> skills,
  }) async {
    emit(
      state.copyWith(
        isSubmitting: true,
        errorMessage: null,
        successMessage: null,
      ),
    );
    try {
      await _repository.createOpportunity(
        companyId: companyId,
        title: title,
        description: description,
        location: location,
        dateEnd: dateEnd,
        skills: skills,
      );
      emit(
        state.copyWith(
          isSubmitting: false,
          successMessage: 'Oportunidade criada com sucesso.',
        ),
      );
      await loadOpportunities(skill: state.selectedSkill);
    } on AppException catch (error) {
      emit(
        state.copyWith(
          isSubmitting: false,
          errorMessage: error.message,
        ),
      );
    }
  }

  Future<void> toggleSaved({
    required int athleteId,
    required int opportunityId,
  }) async {
    final previous = state.opportunities;
    final next = previous.map((opportunity) {
      if (opportunity.id != opportunityId) {
        return opportunity;
      }
      return opportunity.copyWith(isSaved: !opportunity.isSaved);
    }).toList();
    emit(state.copyWith(opportunities: next, errorMessage: null));
    try {
      await _repository.toggleSaved(
        athleteId: athleteId,
        opportunityId: opportunityId,
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          opportunities: previous,
          errorMessage: error.message,
        ),
      );
    }
  }

  Future<void> toggleSubscription({
    required int athleteId,
    required int opportunityId,
  }) async {
    final previous = state.opportunities;
    final next = previous.map((opportunity) {
      if (opportunity.id != opportunityId) {
        return opportunity;
      }
      final subscribed = !opportunity.isSubscribed;
      final count = subscribed
          ? opportunity.subscribersCount + 1
          : opportunity.subscribersCount - 1;
      return opportunity.copyWith(
        isSubscribed: subscribed,
        subscribersCount: count < 0 ? 0 : count,
      );
    }).toList();
    emit(
      state.copyWith(
        opportunities: next,
        selectedOpportunity: _findOpportunity(next, opportunityId),
        errorMessage: null,
      ),
    );
    try {
      await _repository.toggleSubscription(
        athleteId: athleteId,
        opportunityId: opportunityId,
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          opportunities: previous,
          selectedOpportunity: _findOpportunity(previous, opportunityId),
          errorMessage: error.message,
        ),
      );
    }
  }

  Opportunity _mergeLocalState(Opportunity opportunity) {
    final local = _findOpportunity(state.opportunities, opportunity.id);
    if (local == null) {
      return opportunity;
    }
    return opportunity.copyWith(
      isSaved: local.isSaved,
      isSubscribed: local.isSubscribed,
      subscribersCount: local.subscribersCount,
    );
  }

  Opportunity? _findOpportunity(List<Opportunity> items, int opportunityId) {
    for (final item in items) {
      if (item.id == opportunityId) {
        return item;
      }
    }
    return null;
  }
}
