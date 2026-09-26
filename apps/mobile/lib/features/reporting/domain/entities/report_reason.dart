/// The ten report reasons offered by apps/web's `ReportModal`
/// (`REPORT_REASONS`), in the same order and with the same labels. Order
/// matters: it drives the order the radio options render in the sheet.
enum ReportReason {
  spam,
  harassment,
  inappropriateContent,
  fakeProfile,
  fakeOpportunity,
  copyrightViolation,
  violence,
  hateSpeech,
  misinformation,
  other;

  /// Value sent to the API as `reason` when the user leaves the free-text
  /// details field empty (see `ReportCubit.submit`).
  String get apiValue {
    switch (this) {
      case ReportReason.spam:
        return 'spam';
      case ReportReason.harassment:
        return 'harassment';
      case ReportReason.inappropriateContent:
        return 'inappropriate_content';
      case ReportReason.fakeProfile:
        return 'fake_profile';
      case ReportReason.fakeOpportunity:
        return 'fake_opportunity';
      case ReportReason.copyrightViolation:
        return 'copyright_violation';
      case ReportReason.violence:
        return 'violence';
      case ReportReason.hateSpeech:
        return 'hate_speech';
      case ReportReason.misinformation:
        return 'misinformation';
      case ReportReason.other:
        return 'other';
    }
  }

  /// Label shown to the user in the reason picker.
  String get label {
    switch (this) {
      case ReportReason.spam:
        return 'Spam ou conteúdo enganoso';
      case ReportReason.harassment:
        return 'Assédio ou bullying';
      case ReportReason.inappropriateContent:
        return 'Conteúdo inadequado ou ofensivo';
      case ReportReason.fakeProfile:
        return 'Perfil falso';
      case ReportReason.fakeOpportunity:
        return 'Oportunidade falsa';
      case ReportReason.copyrightViolation:
        return 'Violação de direitos autorais';
      case ReportReason.violence:
        return 'Violência ou ameaças';
      case ReportReason.hateSpeech:
        return 'Discurso de ódio';
      case ReportReason.misinformation:
        return 'Desinformação';
      case ReportReason.other:
        return 'Outros';
    }
  }
}
