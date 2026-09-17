import 'dart:convert';

import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/json_body.dart';
import '../feed_constants.dart';
import 'comment_models.dart';
import 'feed_models.dart';

class FeedRemoteDataSource {
  const FeedRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<FeedPostSummaryDto>> getTimeline({int page = 0}) async {
    try {
      final response = await _dio.get<Object?>(
        '/posts/get',
        queryParameters: {'page': page, 'size': kFeedPageSize},
      );
      return decodeJsonList(response.data, FeedPostSummaryDto.fromJson);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<void> createPost({
    required int userId,
    required String content,
  }) async {
    try {
      await _dio.post<void>(
        '/posts/create/$userId',
        data: FormData.fromMap({
          'post': MultipartFile.fromString(
            jsonEncode(PostRequestDto(text: content).toJson()),
            contentType: DioMediaType('application', 'json'),
          ),
        }),
      );
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<void> toggleLike({required int userId, required int postId}) async {
    try {
      await _dio.post<void>('/likes/toggleLike/$userId/$postId');
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<List<CommentDto>> getComments({
    required int postId,
    int page = 0,
  }) async {
    try {
      final response = await _dio.get<Object?>(
        '/comment/get/$postId',
        queryParameters: {'page': page, 'size': kFeedPageSize},
      );
      return decodeJsonList(response.data, CommentDto.fromJson);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<void> createComment({
    required int userId,
    required int postId,
    required String content,
  }) async {
    try {
      await _dio.post<void>(
        '/comment/create',
        queryParameters: {'userId': userId, 'postId': postId},
        data: CommentRequestDto(text: content).toJson(),
      );
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }
}
