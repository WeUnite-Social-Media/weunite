import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import 'feed_models.dart';

class FeedRemoteDataSource {
  const FeedRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<PostDto>> getTimeline({int page = 0}) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/posts/get',
        queryParameters: {'page': page, 'size': 20},
      );
      final body = response.data ?? {};
      final data = body['data'];
      final items = data is Map<String, dynamic>
          ? (data['content'] as List? ?? data['data'] as List? ?? [])
          : data as List? ?? body['content'] as List? ?? [];

      return items
          .whereType<Map>()
          .map((item) => PostDto.fromJson(item.cast<String, dynamic>()))
          .toList();
    } catch (error) {
      throw mapDioError(error);
    }
  }

  Future<void> createPost({required int userId, required String content}) async {
    try {
      await _dio.post<void>(
        '/posts/create/$userId',
        data: FormData.fromMap({'content': content}),
      );
    } catch (error) {
      throw mapDioError(error);
    }
  }

  Future<void> toggleLike({required int userId, required int postId}) async {
    try {
      await _dio.post<void>('/likes/toggleLike/$userId/$postId');
    } catch (error) {
      throw mapDioError(error);
    }
  }
}
