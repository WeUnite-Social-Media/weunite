import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import 'chat_models.dart';

class ChatRemoteDataSource {
  const ChatRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<ConversationDto>> getConversations(int userId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/conversations/user/$userId');
      final items = response.data?['data'] as List? ?? response.data?['content'] as List? ?? [];
      return items
          .whereType<Map>()
          .map((item) => ConversationDto.fromJson(item.cast<String, dynamic>()))
          .toList();
    } catch (error) {
      throw mapDioError(error);
    }
  }

  Future<List<ChatMessageDto>> getMessages({
    required int conversationId,
    required int userId,
  }) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/conversations/$conversationId/messages/$userId',
      );
      final items = response.data?['data'] as List? ?? response.data?['content'] as List? ?? [];
      return items
          .whereType<Map>()
          .map((item) => ChatMessageDto.fromJson(item.cast<String, dynamic>()))
          .toList();
    } catch (error) {
      throw mapDioError(error);
    }
  }
}
