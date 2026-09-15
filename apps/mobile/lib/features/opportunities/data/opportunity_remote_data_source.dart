import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import 'opportunity_models.dart';

class OpportunityRemoteDataSource {
  const OpportunityRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<OpportunityDto>> getOpportunities({
    String? skill,
    int page = 0,
  }) async {
    try {
      final response = await _dio.get<List<dynamic>>(
        '/opportunities/get',
        queryParameters: {
          'page': page,
          'size': 20,
          if (skill != null && skill.isNotEmpty) 'skill': skill,
        },
      );
      final items = response.data ?? [];

      return items
          .map((item) => OpportunityDto.fromJson(item as Map<String, dynamic>))
          .toList();
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
