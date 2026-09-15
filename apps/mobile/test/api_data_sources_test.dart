import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/network/api_diagnostics.dart';
import 'package:weunite_mobile/features/auth/data/auth_remote_data_source.dart';
import 'package:weunite_mobile/features/chat/data/chat_remote_data_source.dart';
import 'package:weunite_mobile/features/feed/data/feed_remote_data_source.dart';
import 'package:weunite_mobile/features/opportunities/data/opportunity_remote_data_source.dart';
import 'package:weunite_mobile/features/profile/data/profile_remote_data_source.dart';

void main() {
  group('API data sources', () {
    test('parses raw post list returned by the API', () async {
      final dataSource = FeedRemoteDataSource(
        _dio({
          '/api/posts/get': [
            {
              'id': '10',
              'text': 'Treino aberto hoje',
              'imageUrl': 'https://example.com/post.png',
              'likesCount': 3,
              'commentsCount': 1,
              'createdAt': '2026-09-15T12:00:00Z',
              'user': {
                'id': '7',
                'name': 'Matheus',
                'username': 'matheus',
                'profileImg': 'https://example.com/avatar.png',
              },
            },
          ],
        }),
      );

      final posts = await dataSource.getTimeline();

      expect(posts, hasLength(1));
      expect(posts.single.content, 'Treino aberto hoje');
      expect(posts.single.authorName, 'Matheus');
      expect(posts.single.likesCount, 3);
    });

    test('parses raw opportunities list returned by the API', () async {
      final dataSource = OpportunityRemoteDataSource(
        _dio({
          '/api/opportunities/get': [
            {
              'id': 4,
              'title': 'Peneira sub-20',
              'description': 'Selecao para atletas',
              'location': 'Sao Paulo',
              'dateEnd': '2026-10-01',
              'subscribersCount': 12,
              'company': {'name': 'WeUnite FC', 'username': 'weunite'},
              'skills': [
                {'name': 'Velocidade'},
                {'name': 'Passe'},
              ],
            },
          ],
        }),
      );

      final opportunities = await dataSource.getOpportunities();

      expect(opportunities, hasLength(1));
      expect(opportunities.single.title, 'Peneira sub-20');
      expect(opportunities.single.companyName, 'WeUnite FC');
      expect(opportunities.single.skills, ['Velocidade', 'Passe']);
    });

    test('parses raw conversation and message lists returned by the API',
        () async {
      final dio = _dio({
        '/api/conversations/user/7': [
          {
            'id': 30,
            'participantIds': [7, 9],
            'unreadCount': 2,
            'lastMessage': {
              'id': 55,
              'conversationId': 30,
              'senderId': 9,
              'content': 'Oi!',
              'isRead': false,
              'createdAt': '2026-09-15T12:10:00Z',
            },
          },
        ],
        '/api/conversations/30/messages/7': [
          {
            'id': 55,
            'conversationId': 30,
            'senderId': 9,
            'content': 'Oi!',
            'isRead': true,
            'createdAt': '2026-09-15T12:10:00Z',
          },
        ],
      });
      final dataSource = ChatRemoteDataSource(dio);

      final conversations = await dataSource.getConversations(7);
      final messages = await dataSource.getMessages(
        conversationId: 30,
        userId: 7,
      );

      expect(conversations.single.lastMessage, 'Oi!');
      expect(conversations.single.unreadCount, 2);
      expect(messages.single.content, 'Oi!');
      expect(messages.single.read, isTrue);
    });

    test('keeps profile parsing compatible with ResponseDTO.data', () async {
      final dataSource = ProfileRemoteDataSource(
        _dio({
          '/api/user/id/7': {
            'message': 'ok',
            'data': {
              'id': '7',
              'name': 'Matheus',
              'username': 'matheus',
              'role': 'athlete',
              'bio': 'Atleta',
            },
          },
        }),
      );

      final profile = await dataSource.getProfileById(7);

      expect(profile.id, 7);
      expect(profile.name, 'Matheus');
      expect(profile.role, 'athlete');
    });

    test('verifies email with the backend ResponseDTO session', () async {
      final dataSource = AuthRemoteDataSource(
        _dio({
          '/api/auth/verify-email/matheus%40example.com': {
            'message': 'Email verificado com sucesso!',
            'data': {
              'jwt': 'jwt-token',
              'user': {
                'id': '7',
                'name': 'Matheus',
                'username': 'matheus',
                'email': 'matheus@example.com',
                'role': 'athlete',
              },
            },
          },
        }),
      );

      final session = await dataSource.verifyEmail(
        email: 'matheus@example.com',
        verificationToken: '123456',
      );

      expect(session.jwt, 'jwt-token');
      expect(session.user.email, 'matheus@example.com');
    });

    test('maps unexpected response shapes as server format errors', () async {
      final dataSource = FeedRemoteDataSource(
        _dio({
          '/api/posts/get': {'data': []},
        }),
      );

      expect(
        dataSource.getTimeline,
        throwsA(
          isA<AppException>().having(
            (error) => error.message,
            'message',
            contains('formato inesperado'),
          ),
        ),
      );
    });

    test('surfaces backend auth error messages', () async {
      final dataSource = AuthRemoteDataSource(
        _dio({
          '/api/auth/login': const _FakeResponse(
            statusCode: 401,
            body: {
              'message': 'Usuario ou senha invalidos',
              'error': 'UNAUTHORIZED',
            },
          ),
        }),
      );

      expect(
        () => dataSource.login(username: 'matheus', password: 'wrong-pass'),
        throwsA(
          isA<AppException>().having(
            (error) => error.message,
            'message',
            'Usuario ou senha invalidos',
          ),
        ),
      );
    });

    test('surfaces backend validation field messages', () async {
      final dataSource = AuthRemoteDataSource(
        _dio({
          '/api/auth/verify-email/matheus%40example.com': const _FakeResponse(
            statusCode: 400,
            body: {
              'verificationToken': 'O codigo deve conter 6 digitos',
            },
          ),
        }),
      );

      expect(
        () => dataSource.verifyEmail(
          email: 'matheus@example.com',
          verificationToken: '123',
        ),
        throwsA(
          isA<AppException>().having(
            (error) => error.message,
            'message',
            'O codigo deve conter 6 digitos',
          ),
        ),
      );
    });
  });

  group('ApiDiagnostics', () {
    test('logs metadata without request or response body values', () async {
      final logs = <String>[];
      final dio = _dio(
        {
          '/api/posts/get': [
            {'id': 1, 'text': 'segredo no corpo'},
          ],
        },
        log: logs.add,
      );

      await dio.get<List<dynamic>>(
        '/posts/get',
        queryParameters: {'token': 'query-secret'},
        data: {'password': 'body-secret'},
      );

      expect(logs.join('\n'), contains('GET http://localhost/api/posts/get'));
      expect(logs.join('\n'), contains('List(1)'));
      expect(logs.join('\n'), isNot(contains('query-secret')));
      expect(logs.join('\n'), isNot(contains('body-secret')));
      expect(logs.join('\n'), isNot(contains('segredo no corpo')));
    });
  });
}

Dio _dio(
  Map<String, Object?> responses, {
  void Function(String message)? log,
}) {
  final dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost/api',
      headers: const {Headers.acceptHeader: Headers.jsonContentType},
    ),
  )..httpClientAdapter = _FakeAdapter(responses);
  if (log != null) {
    dio.interceptors.add(ApiDiagnostics(log: log));
  }
  return dio;
}

class _FakeAdapter implements HttpClientAdapter {
  const _FakeAdapter(this.responses);

  final Map<String, Object?> responses;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    final response = responses[options.uri.path];
    if (!responses.containsKey(options.uri.path)) {
      return ResponseBody.fromString(
        jsonEncode({'message': 'not found'}),
        404,
        headers: {
          Headers.contentTypeHeader: [Headers.jsonContentType],
        },
      );
    }
    final statusCode = response is _FakeResponse ? response.statusCode : 200;
    final body = response is _FakeResponse ? response.body : response;
    return ResponseBody.fromString(
      jsonEncode(body),
      statusCode,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

class _FakeResponse {
  const _FakeResponse({
    required this.statusCode,
    required this.body,
  });

  final int statusCode;
  final Object? body;
}
