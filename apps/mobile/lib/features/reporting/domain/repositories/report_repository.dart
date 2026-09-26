import '../entities/report_entity_type.dart';

abstract class ReportRepository {
  /// `POST /reports/create/{userId}` — the path `userId` is always the
  /// signed-in user (resolved internally, see `ReportRepositoryImpl`); the
  /// backend rejects the request when it doesn't match the JWT.
  ///
  /// [reason] is already resolved by the caller: `ReportCubit.submit`
  /// mirrors apps/web's `ReportModal.handleSubmit`, where free-text details
  /// replace the reason code when present. Returns the backend's success
  /// message (e.g. "Denúncia registrada com sucesso!"), or `null` if the
  /// envelope omitted it.
  Future<String?> submitReport({
    required ReportEntityType type,
    required int entityId,
    required String reason,
  });
}
