import 'dart:convert';

import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import '../../../core/network/image_media_type.dart';
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

  /// `GET /posts/search?query=` — posts whose text matches the query.
  Future<List<FeedPostSummaryDto>> searchPosts({
    required String query,
    int page = 0,
  }) async {
    try {
      final response = await _dio.get<Object?>(
        '/posts/search',
        queryParameters: {'query': query, 'page': page, 'size': kFeedPageSize},
      );
      return decodeJsonList(response.data, FeedPostSummaryDto.fromJson);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<List<FeedPostSummaryDto>> getUserPosts({
    required int userId,
    int page = 0,
  }) async {
    try {
      final response = await _dio.get<Object?>(
        '/posts/get/user/$userId',
        queryParameters: {'page': page, 'size': kFeedPageSize},
      );
      return decodeJsonList(response.data, FeedPostSummaryDto.fromJson);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `POST /posts/create/{userId}` is multipart: a JSON `post` part and an
  /// optional `image` file part, which the API uploads to Cloudinary.
  Future<void> createPost({
    required int userId,
    required String content,
    String? imagePath,
  }) async {
    try {
      final parts = <String, Object>{
        'post': MultipartFile.fromString(
          jsonEncode(PostRequestDto(text: content).toJson()),
          contentType: DioMediaType('application', 'json'),
        ),
      };
      if (imagePath != null) {
        final filename = imagePath.split(RegExp(r'[\\/]')).last;
        parts['image'] = await MultipartFile.fromFile(
          imagePath,
          filename: filename,
          contentType: imageMediaTypeFor(filename),
        );
      }
      await _dio.post<void>(
        '/posts/create/$userId',
        data: FormData.fromMap(parts),
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
