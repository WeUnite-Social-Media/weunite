import 'package:dio/dio.dart';

import '../../../core/contracts/user_dto.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/image_media_type.dart';
import '../../../core/network/json_body.dart';
import 'chat_models.dart';

class ChatRemoteDataSource {
  const ChatRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<ConversationDto>> getConversations(int userId) async {
    try {
      final response = await _dio.get<Object?>('/conversations/user/$userId');
      return decodeJsonList(response.data, ConversationDto.fromJson);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<ConversationDto> getConversation({
    required int conversationId,
    required int userId,
  }) async {
    try {
      final response = await _dio.get<Object?>(
        '/conversations/$conversationId/user/$userId',
      );
      return ConversationDto.fromJson(asJsonObject(response.data));
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<List<MessageDto>> getMessages({
    required int conversationId,
    required int userId,
  }) async {
    try {
      final response = await _dio.get<Object?>(
        '/conversations/$conversationId/messages/$userId',
      );
      return decodeJsonList(response.data, MessageDto.fromJson);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `PUT /conversations/{id}/read/{userId}` — marks the messages the peer
  /// sent in that conversation as read.
  Future<void> markAsRead({
    required int conversationId,
    required int userId,
  }) async {
    try {
      await _dio.put<void>('/conversations/$conversationId/read/$userId');
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `POST /messages/upload` — uploads the attachment to Cloudinary and
  /// returns its URL. It does not create the message: the caller still sends
  /// it over STOMP, with that URL as the content.
  Future<String> uploadAttachment({
    required int conversationId,
    required int senderId,
    required String filePath,
  }) async {
    try {
      final filename = filePath.split(RegExp(r'[\\/]')).last;
      final response = await _dio.post<Object?>(
        '/messages/upload',
        data: FormData.fromMap({
          'file': await MultipartFile.fromFile(
            filePath,
            filename: filename,
            contentType: imageMediaTypeFor(filename),
          ),
          'conversationId': conversationId,
          'senderId': senderId,
        }),
      );
      return asJsonObject(response.data)['fileUrl']! as String;
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `GET /user/id/{id}` (openapi: paths./api/user/id/{id}), used to
  /// resolve a conversation's peer name/avatar. Deliberately not imported
  /// from `features/profile/data`, since a feature never imports another
  /// feature's `data` layer (see plan section 2, rule 1).
  Future<UserDto> getUser(int userId) async {
    try {
      final response = await _dio.get<Object?>('/user/id/$userId');
      return decodeResponseData<UserDto>(
        response.data,
        (data) => UserDto.fromJson(asJsonObject(data)),
      );
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }
}
