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
      ),
    );
    try {
      final opportunities = await _repository.getOpportunities(skill: skill);
      emit(state.copyWith(isLoading: false, opportunities: opportunities));
    } on AppException catch (error) {
      emit(state.copyWith(isLoading: false, errorMessage: error.message));
    }
  }
}
