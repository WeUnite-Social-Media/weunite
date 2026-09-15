import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import 'chat_models.dart';

class ChatRemoteDataSource {
  const ChatRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<ConversationDto>> getConversations(int userId) async {
    try {
      final response =
          await _dio.get<List<dynamic>>('/conversations/user/$userId');
      final items = response.data ?? [];
      return items
          .map((item) => ConversationDto.fromJson(item as Map<String, dynamic>))
          .toList();
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<List<ChatMessageDto>> getMessages({
    required int conversationId,
    required int userId,
  }) async {
    try {
      final response = await _dio.get<List<dynamic>>(
        '/conversations/$conversationId/messages/$userId',
      );
      final items = response.data ?? [];
      return items
          .map((item) => ChatMessageDto.fromJson(item as Map<String, dynamic>))
          .toList();
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }
}
