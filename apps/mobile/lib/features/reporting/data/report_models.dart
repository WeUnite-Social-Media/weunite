import 'package:json_annotation/json_annotation.dart';

part 'report_models.g.dart';

/// Request body for `POST /reports/create/{userId}` (backend
/// `CreateReportRequestDTO`). Not present in `openapi/weunite-api.json` (like
/// the STOMP chat payloads noted in `AGENTS.md`, this endpoint isn't
/// documented there), typed by hand from apps/web's
/// `features/reporting/api/reportService.ts`, the source of truth used to
/// build this feature.
@JsonSerializable(createFactory: false, createToJson: true)
class CreateReportRequestDto {
  const CreateReportRequestDto({
    required this.type,
    required this.entityId,
    required this.reason,
  });

  /// "POST" | "OPPORTUNITY" | "COMMENT".
  final String type;
  final int entityId;
  final String reason;

  Map<String, dynamic> toJson() => _$CreateReportRequestDtoToJson(this);
}
