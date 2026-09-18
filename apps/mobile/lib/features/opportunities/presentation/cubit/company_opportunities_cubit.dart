import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/opportunity.dart';
import '../../domain/repositories/opportunity_repository.dart';

part 'company_opportunities_state.dart';

/// Opportunities published by one company (`GET /opportunities/get/company/{id}`),
/// shown on that company's profile. Read-only: saving and applying live in the
/// Opportunities tab, which owns [OpportunitiesCubit].
class CompanyOpportunitiesCubit extends Cubit<CompanyOpportunitiesState> {
  CompanyOpportunitiesCubit(this._repository, {required this.companyId})
      : super(const CompanyOpportunitiesState());

  final OpportunityRepository _repository;
  final int companyId;

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
