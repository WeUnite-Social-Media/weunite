import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/json_body.dart';
import 'opportunity_models.dart';

class OpportunityRemoteDataSource {
  const OpportunityRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<OpportunityDto>> getOpportunities({int page = 0}) async {
    try {
      final response = await _dio.get<Object?>(
        '/opportunities/get',
        queryParameters: {'page': page, 'size': 20},
      );
      return decodeJsonList(response.data, OpportunityDto.fromJson);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// Opportunities the athlete bookmarked. The page size is generous on
  /// purpose: the flags are resolved in one request instead of one per card.
  Future<List<SavedOpportunityDto>> getSavedOpportunities({
    required int athleteId,
  }) async {
    try {
      final response = await _dio.get<Object?>(
        '/saved-opportunities/athlete/$athleteId',
        queryParameters: {'page': 0, 'size': 100},
      );
      return decodeJsonList(response.data, SavedOpportunityDto.fromJson);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// Opportunities the athlete applied to.
  Future<List<SubscriberDto>> getSubscriptions({
    required int athleteId,
  }) async {
    try {
      final response = await _dio.get<Object?>(
        '/subscriber/athlete/$athleteId',
        queryParameters: {'page': 0, 'size': 100},
      );
      return decodeJsonList(response.data, SubscriberDto.fromJson);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<bool> isSaved({
    required int athleteId,
    required int opportunityId,
  }) async {
    try {
      final response = await _dio.get<Object?>(
        '/saved-opportunities/isSaved/$athleteId/$opportunityId',
      );
      return response.data! as bool;
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<bool> isSubscribed({
    required int athleteId,
    required int opportunityId,
  }) async {
    try {
      final response = await _dio.get<Object?>(
        '/subscriber/isSubscribed/$athleteId/$opportunityId',
      );
      return response.data! as bool;
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
