import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import 'feed_models.dart';

class FeedRemoteDataSource {
  const FeedRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<PostDto>> getTimeline({int page = 0}) async {
    try {
      final response = await _dio.get<List<dynamic>>(
        '/posts/get',
        queryParameters: {'page': page, 'size': 20},
      );
      final items = response.data ?? [];

      return items
          .map((item) => PostDto.fromJson(item as Map<String, dynamic>))
          .toList();
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
        data: FormData.fromMap({'content': content}),
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
}
