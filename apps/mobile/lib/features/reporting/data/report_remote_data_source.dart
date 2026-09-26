import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/json_body.dart';
import 'report_models.dart';

class ReportRemoteDataSource {
  const ReportRemoteDataSource(this._dio);

  final Dio _dio;

  /// `POST /reports/create/{userId}` — Spring envelope `{"message": ...,
  /// "data": {...}}` (unlike notifications/opportunities/etc., which return
  /// raw arrays). The mobile app doesn't model the `data` object (the report
  /// record: id/reporter/status/...) because nothing today reads it back —
  /// only the success message reaches the UI. `decodeResponseData` is still
  /// used to validate the envelope shape (throws `FormatException` when
  /// `data` is missing, matching every other envelope-decoded endpoint);
  /// `message` is then read directly off the same decoded JSON object.
  Future<String?> createReport({
    required int userId,
    required String type,
    required int entityId,
    required String reason,
  }) async {
    try {
      final response = await _dio.post<Object?>(
        '/reports/create/$userId',
        data: CreateReportRequestDto(
          type: type,
          entityId: entityId,
          reason: reason,
        ).toJson(),
      );
      final json = asJsonObject(response.data);
      decodeResponseData<Object?>(json, (data) => data);
      final message = json['message'];
      return message is String ? message : null;
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }
}
