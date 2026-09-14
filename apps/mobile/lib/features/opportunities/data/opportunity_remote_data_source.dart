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
      final response = await _dio.get<Map<String, dynamic>>(
        '/opportunities/get',
        queryParameters: {
          'page': page,
          'size': 20,
          if (skill != null && skill.isNotEmpty) 'skill': skill,
        },
      );
      final body = response.data ?? {};
      final data = body['data'];
      final items = data is Map<String, dynamic>
          ? (data['content'] as List? ?? data['data'] as List? ?? [])
          : data as List? ?? body['content'] as List? ?? [];

      return items
          .whereType<Map>()
          .map((item) => OpportunityDto.fromJson(item.cast<String, dynamic>()))
          .toList();
    } catch (error) {
      throw mapDioError(error);
    }
  }

  Future<void> toggleSaved({
    required int athleteId,
    required int opportunityId,
  }) async {
    try {
      await _dio.post<void>('/saved-opportunities/toggle/$athleteId/$opportunityId');
    } catch (error) {
      throw mapDioError(error);
    }
  }

  Future<void> toggleSubscription({
    required int athleteId,
    required int opportunityId,
  }) async {
    try {
      await _dio.post<void>('/subscriber/toggleSubscriber/$athleteId/$opportunityId');
    } catch (error) {
      throw mapDioError(error);
    }
  }
}
