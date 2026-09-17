import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/json_body.dart';
import 'opportunity_models.dart';

class OpportunityRemoteDataSource {
  const OpportunityRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<OpportunityDto>> getOpportunities({
    String? skill,
    int page = 0,
  }) async {
    try {
      final response = await _dio.get<Object?>(
        '/opportunities/get',
        queryParameters: {
          'page': page,
          'size': 20,
          if (skill != null && skill.isNotEmpty) 'skill': skill,
        },
      );
      return decodeJsonList(response.data, OpportunityDto.fromJson);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<void> toggleSaved({
    required int athleteId,
    required int opportunityId,
  }) async {
    try {
      await _dio
          .post<void>('/saved-opportunities/toggle/$athleteId/$opportunityId');
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<void> toggleSubscription({
    required int athleteId,
    required int opportunityId,
  }) async {
    try {
      await _dio
          .post<void>('/subscriber/toggleSubscriber/$athleteId/$opportunityId');
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }
}
