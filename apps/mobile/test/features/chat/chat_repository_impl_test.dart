import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/session/current_user_provider.dart';
import 'package:weunite_mobile/features/chat/data/chat_models.dart';
import 'package:weunite_mobile/features/chat/data/chat_realtime_client.dart';
import 'package:weunite_mobile/features/chat/data/chat_remote_data_source.dart';
import 'package:weunite_mobile/features/chat/data/chat_repository_impl.dart';
import 'package:weunite_mobile/features/chat/domain/entities/chat_realtime_event.dart';

import '../../fixtures/api_payloads.dart';

Map<String, Object?> _conversation({
  required int id,
  required List<int> participantIds,
}) {
  return {
    'id': id,
    'participantIds': participantIds,
    'unreadCount': 0,
  };
}

void main() {
  group('ChatRepositoryImpl.getConversations peer resolution', () {
    test(
        'resolves the peer (the participant that is not the current user) '
        'via GET /user/id/{id}', () async {
      final repository = _repository(
        currentUserId: 7,
        responses: {
          '/api/conversations/user/7': _Response([
            _conversation(id: 30, participantIds: [7, 9]),
          ]),
          '/api/user/id/9': _Response(responseDto({...userJson, 'id': '9'})),
        },
      );

      final conversations = await repository.getConversations();

      expect(conversations.single.peerUserId, 9);
      expect(conversations.single.peerName, 'Matheus Silva');
      expect(conversations.single.peerUsername, 'matheus');
    });

    test('a peer request that 404s leaves peerName null without throwing',
        () async {
      final repository = _repository(
        currentUserId: 7,
        responses: {
          '/api/conversations/user/7': _Response([
            _conversation(id: 30, participantIds: [7, 9]),
          ]),
          '/api/user/id/9': _Response(null, statusCode: 404),
        },
      );

      final conversations = await repository.getConversations();

      expect(conversations.single.peerUserId, 9);
      expect(conversations.single.peerName, isNull);
    });

    test('a peer request that fails with a 500 rethrows as AppException',
        () async {
      final repository = _repository(
        currentUserId: 7,
        responses: {
          '/api/conversations/user/7': _Response([
            _conversation(id: 30, participantIds: [7, 9]),
          ]),
          '/api/user/id/9': _Response(null, statusCode: 500),
        },
      );

      await expectLater(
        repository.getConversations,
        throwsA(isA<AppException>()),
      );
    });

    test('two conversations with the same peer trigger a single user request',
        () async {
      var userRequests = 0;
      final repository = _repository(
        currentUserId: 7,
        responses: {
          '/api/conversations/user/7': _Response([
            _conversation(id: 30, participantIds: [7, 9]),
            _conversation(id: 31, participantIds: [7, 9]),
          ]),
          '/api/user/id/9': _Response(
            responseDto({...userJson, 'id': '9'}),
            onRequest: () => userRequests++,
          ),
        },
      );

      final conversations = await repository.getConversations();

      expect(conversations, hasLength(2));
      expect(userRequests, 1);
    });

    test(
        'a conversation with only the current user resolves no peer and '
        'makes no user request', () async {
      var userRequests = 0;
      final repository = _repository(
        currentUserId: 7,
        responses: {
          '/api/conversations/user/7': _Response([
            _conversation(id: 30, participantIds: [7]),
          ]),
          '/api/user/id/7': _Response(
            responseDto(userJson),
            onRequest: () => userRequests++,
          ),
        },
      );

      final conversations = await repository.getConversations();

      expect(conversations.single.peerUserId, isNull);
      expect(conversations.single.peerName, isNull);
      expect(userRequests, 0);
    });
  });
}

ChatRepositoryImpl _repository({
  required int currentUserId,
  required Map<String, _Response> responses,
}) {
  return ChatRepositoryImpl(
    remoteDataSource: ChatRemoteDataSource(_dio(responses)),
    realtimeClient: _NoopChatRealtimeClient(),
    currentUserProvider: _FakeCurrentUserProvider(currentUserId),
  );
}

class _FakeCurrentUserProvider implements CurrentUserProvider {
  _FakeCurrentUserProvider(this.currentUserId);

  @override
  final int? currentUserId;

  @override
  int requireUserId() => currentUserId!;
}

class _NoopChatRealtimeClient implements ChatRealtimeClient {
  @override
  bool get isConnected => false;

  @override
  Future<void> connect() async {}

  @override
  Stream<ChatRealtimeEvent> subscribeConversationRead(int conversationId) =>
      const Stream.empty();

  final readReceipts = <int>[];

  @override
  void sendReadReceipt({required int conversationId, required int userId}) {
    readReceipts.add(conversationId);
  }

  @override
  Stream<ChatRealtimeEvent> subscribeConversation(int conversationId) =>
      const Stream.empty();

  @override
  void sendMessage({
    required int conversationId,
    required int senderId,
    required String content,
    MessageTypeDto type = MessageTypeDto.text,
  }) {}

  @override
  Future<void> disconnect() async {}
}

class _Response {
  const _Response(this.body, {this.statusCode = 200, this.onRequest});

  final Object? body;
  final int statusCode;
  final void Function()? onRequest;
}

Dio _dio(Map<String, _Response> responses) {
  return Dio(
    BaseOptions(
      baseUrl: 'http://localhost/api',
      headers: const {Headers.acceptHeader: Headers.jsonContentType},
    ),
  )..httpClientAdapter = _FakeAdapter(responses);
}

class _FakeAdapter implements HttpClientAdapter {
  const _FakeAdapter(this.responses);

  final Map<String, _Response> responses;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    final response = responses[options.uri.path];
    if (response == null) {
      return ResponseBody.fromString(
        jsonEncode({'message': 'not found'}),
        404,
        headers: {
          Headers.contentTypeHeader: [Headers.jsonContentType],
        },
      );
    }
    response.onRequest?.call();
    return ResponseBody.fromString(
      jsonEncode(response.body),
      response.statusCode,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}
