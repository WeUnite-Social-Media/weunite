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

  void dismissActionError() {
    if (state.actionErrorMessage == null) {
      return;
    }
    emit(state.copyWith(actionErrorMessage: () => null));
  }
}
