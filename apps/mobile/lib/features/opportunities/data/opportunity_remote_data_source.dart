import 'dart:convert';

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

  Future<OpportunityDto> getOpportunity({required int opportunityId}) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/opportunities/get/$opportunityId',
      );
      final data = response.data?['data'] is Map<String, dynamic>
          ? response.data!['data'] as Map<String, dynamic>
          : response.data ?? {};
      return OpportunityDto.fromJson(data);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<void> createOpportunity({
    required int companyId,
    required String title,
    required String description,
    required String location,
    required DateTime dateEnd,
    required List<String> skills,
  }) async {
    try {
      await _dio.post<void>(
        '/opportunities/create/$companyId',
        data: FormData.fromMap({
          'opportunity': MultipartFile.fromString(
            jsonEncode({
              'title': title,
              'description': description,
              'location': location,
              'dateEnd': _formatDate(dateEnd),
              'skills': skills
                  .where((skill) => skill.trim().isNotEmpty)
                  .map((skill) => {'name': skill.trim()})
                  .toList(),
            }),
            contentType: DioMediaType('application', 'json'),
          ),
        }),
      );
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  String _formatDate(DateTime value) {
    final month = value.month.toString().padLeft(2, '0');
    final day = value.day.toString().padLeft(2, '0');
    return '${value.year}-$month-$day';
  }
}
