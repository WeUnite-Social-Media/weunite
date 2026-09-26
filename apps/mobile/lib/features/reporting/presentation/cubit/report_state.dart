part of 'report_cubit.dart';

class ReportState extends Equatable {
  const ReportState({
    this.reason,
    this.details = '',
    this.isSubmitting = false,
    this.isSuccess = false,
    this.actionErrorMessage,
    this.successMessage,
  });

  final ReportReason? reason;
  final String details;
  final bool isSubmitting;
  final bool isSuccess;
  final String? actionErrorMessage;
  final String? successMessage;

  bool get canSubmit => reason != null && !isSubmitting;

  ReportState copyWith({
    ValueGetter<ReportReason?>? reason,
    String? details,
    bool? isSubmitting,
    bool? isSuccess,
    ValueGetter<String?>? actionErrorMessage,
    ValueGetter<String?>? successMessage,
  }) {
    return ReportState(
      reason: reason != null ? reason() : this.reason,
      details: details ?? this.details,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isSuccess: isSuccess ?? this.isSuccess,
      actionErrorMessage: actionErrorMessage != null
          ? actionErrorMessage()
          : this.actionErrorMessage,
      successMessage:
          successMessage != null ? successMessage() : this.successMessage,
    );
  }

  @override
  List<Object?> get props => [
        reason,
        details,
        isSubmitting,
        isSuccess,
        actionErrorMessage,
        successMessage,
      ];
}
