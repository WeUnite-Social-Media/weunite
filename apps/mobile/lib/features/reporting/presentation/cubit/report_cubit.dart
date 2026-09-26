import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../domain/entities/report_entity_type.dart';
import '../../domain/entities/report_reason.dart';
import '../../domain/repositories/report_repository.dart';

part 'report_state.dart';

/// Backs the report bottom sheet opened by `showReportSheet`. Not coupled to
/// any single entity type — posts wire it up first (`PostCard`'s three-dot
/// menu); opportunities/comments are expected to reuse it as-is.
class ReportCubit extends Cubit<ReportState> {
  ReportCubit(
    this._repository, {
    required this.type,
    required this.entityId,
  }) : super(const ReportState());

  final ReportRepository _repository;
  final ReportEntityType type;
  final int entityId;

  void reasonChanged(ReportReason reason) {
    emit(state.copyWith(reason: () => reason));
  }

  void detailsChanged(String details) {
    emit(state.copyWith(details: details));
  }

  Future<void> submit() async {
    if (state.isSubmitting) {
      return;
    }
    final reason = state.reason;
    if (reason == null) {
      emit(
        state.copyWith(
          actionErrorMessage: () =>
              'Por favor, selecione um motivo para a denúncia',
        ),
      );
      return;
    }
    emit(state.copyWith(isSubmitting: true, actionErrorMessage: () => null));
    try {
      // Web parity (`ReportModal.handleSubmit`): free-text details, when
      // present, REPLACE the reason code sent to the API — the code is only
      // used as a fallback when the user leaves the details field empty.
      final details = state.details.trim();
      final resolvedReason = details.isNotEmpty ? details : reason.apiValue;
      final message = await _repository.submitReport(
        type: type,
        entityId: entityId,
        reason: resolvedReason,
      );
      emit(
        state.copyWith(
          isSubmitting: false,
          isSuccess: true,
          successMessage: () =>
              message ??
              'Denúncia enviada com sucesso! Nossa equipe irá analisá-la em '
                  'breve.',
        ),
      );
    } on AppException catch (error) {
      emit(
        state.copyWith(
          isSubmitting: false,
          actionErrorMessage: () => 'Erro ao enviar denúncia: ${error.message}',
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
