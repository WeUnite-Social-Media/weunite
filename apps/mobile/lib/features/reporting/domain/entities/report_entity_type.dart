/// `CreateReportRequestDTO.type` (backend `ReportType` enum, apps/web:
/// `ReportModal`'s `entityType` prop). Reused across every reportable entity
/// so `showReportSheet` isn't coupled to posts.
enum ReportEntityType {
  post,
  opportunity,
  comment;

  /// Value sent to the API in `POST /reports/create/{userId}`'s body.
  String get apiValue {
    switch (this) {
      case ReportEntityType.post:
        return 'POST';
      case ReportEntityType.opportunity:
        return 'OPPORTUNITY';
      case ReportEntityType.comment:
        return 'COMMENT';
    }
  }

  /// Bottom sheet title — exact copy from apps/web's `ReportModal`.
  String get sheetTitle {
    switch (this) {
      case ReportEntityType.post:
        return 'Denunciar Post';
      case ReportEntityType.comment:
        return 'Denunciar Comentario';
      case ReportEntityType.opportunity:
        return 'Denunciar Oportunidade';
    }
  }
}
