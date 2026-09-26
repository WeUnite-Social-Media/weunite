import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/network/api_diagnostics.dart';
import 'package:weunite_mobile/features/auth/data/auth_remote_data_source.dart';
import 'package:weunite_mobile/features/chat/data/chat_models.dart';
import 'package:weunite_mobile/features/chat/data/chat_remote_data_source.dart';
import 'package:weunite_mobile/features/feed/data/feed_remote_data_source.dart';
import 'package:weunite_mobile/features/opportunities/data/opportunity_remote_data_source.dart';
import 'package:weunite_mobile/features/profile/data/profile_remote_data_source.dart';

import 'fixtures/api_payloads.dart';

void main() {
  group('API data sources', () {
    test('parses raw post list returned by the API', () async {
      final dataSource = FeedRemoteDataSource(
        _dio({
          '/api/posts/get': [feedPostSummaryJson],
        }),
      );

      final posts = await dataSource.getTimeline();

      expect(posts, hasLength(1));
      final post = posts.single.toEntity();
      expect(post.content, 'Treino aberto hoje');
      expect(post.authorName, 'Matheus Silva');
      expect(post.likesCount, 3);
      expect(post.likedByViewer, isTrue);
    });

    test('parses raw comments list returned by the API', () async {
      final dataSource = FeedRemoteDataSource(
        _dio({
          '/api/comment/get/10': [commentJson],
        }),
      );

      final comments = await dataSource.getComments(postId: 10);

      expect(comments, hasLength(1));
      final comment = comments.single.toEntity();
      expect(comment.content, 'Boa!');
      expect(comment.authorUsername, 'matheus');
    });

    test('parses raw opportunities list returned by the API', () async {
      final dataSource = OpportunityRemoteDataSource(
        _dio({
          '/api/opportunities/get': [opportunityJson],
        }),
      );

      final opportunities = await dataSource.getOpportunities();

      expect(opportunities, hasLength(1));
      final opportunity = opportunities.single.toEntity();
      expect(opportunity.title, 'Peneira sub-20');
      expect(opportunity.companyName, 'Matheus Silva');
      expect(opportunity.skills, ['Velocidade', 'Passe']);
    });

    test('parses raw conversation and message lists returned by the API',
        () async {
      final dio = _dio({
        '/api/conversations/user/7': [conversationJson],
        '/api/conversations/30/messages/7': [messageJson],
      });
      final dataSource = ChatRemoteDataSource(dio);

      final conversations = await dataSource.getConversations(7);
      final messages = await dataSource.getMessages(
        conversationId: 30,
        userId: 7,
      );

      expect(conversations.single.lastMessage?.content, 'Oi!');
      expect(conversations.single.unreadCount, 2);
      expect(messages.single.content, 'Oi!');
      expect(messages.single.isRead, isTrue);
      expect(messages.single.conversationId, 30);
      expect(messages.single.type, MessageTypeDto.text);
    });

    test('parses ResponseDTO<UserDTO> profile', () async {
      final dataSource = ProfileRemoteDataSource(
        _dio({
          '/api/user/id/7': responseDto(userJson),
        }),
      );

      final user = await dataSource.getProfileById(7);

      expect(user.id, 7);
      expect(user.name, 'Matheus Silva');
      expect(user.role, 'ATHLETE');
    });

    test('parses ResponseDTO<Long> follow counts', () async {
      final dataSource = ProfileRemoteDataSource(
        _dio({
          '/api/follow/followers/7/count': responseDto(3),
        }),
      );

      final followers = await dataSource.countFollowers(7);

      expect(followers, 3);
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

    group('malformed payloads become server-format AppExceptions', () {
      Matcher isServerFormatError() => throwsA(
            isA<AppException>().having(
              (error) => error.message,
              'message',
              contains('formato inesperado'),
            ),
          );

      test('post with a numeric id', () async {
        final dataSource = FeedRemoteDataSource(
          _dio({
            '/api/posts/get': [
              {...feedPostSummaryJson, 'id': 10},
            ],
          }),
        );

        expect(dataSource.getTimeline, isServerFormatError());
      });

      test('post with an invalid createdAt', () async {
        final dataSource = FeedRemoteDataSource(
          _dio({
            '/api/posts/get': [
              {...feedPostSummaryJson, 'createdAt': 'ontem'},
            ],
          }),
        );

        expect(dataSource.getTimeline, isServerFormatError());
      });

      test('post without a user', () async {
        final dataSource = FeedRemoteDataSource(
          _dio({
            '/api/posts/get': [
              {...feedPostSummaryJson}..remove('user'),
            ],
          }),
        );

        expect(dataSource.getTimeline, isServerFormatError());
      });

      test('timeline with a null body', () async {
        final dataSource = FeedRemoteDataSource(
          _dio({'/api/posts/get': null}),
        );

        expect(dataSource.getTimeline, isServerFormatError());
      });

      test('login response without a data key', () async {
        final dataSource = AuthRemoteDataSource(
          _dio({
            '/api/auth/login': {'message': 'ok'},
          }),
        );

        expect(
          () => dataSource.login(username: 'matheus', password: 'secret'),
          isServerFormatError(),
        );
      });

      test('profile response body is a list instead of an object', () async {
        final dataSource = ProfileRemoteDataSource(
          _dio({'/api/user/id/7': []}),
        );

        expect(() => dataSource.getProfileById(7), isServerFormatError());
      });

      test('opportunity without a company', () async {
        final dataSource = OpportunityRemoteDataSource(
          _dio({
            '/api/opportunities/get': [
              {...opportunityJson}..remove('company'),
            ],
          }),
        );

        expect(dataSource.getOpportunities, isServerFormatError());
      });

      test('message with an unknown type', () async {
        final dataSource = ChatRemoteDataSource(
          _dio({
            '/api/conversations/30/messages/7': [
              {...messageJson, 'type': 'VIDEO'},
            ],
          }),
        );

        expect(
          () => dataSource.getMessages(conversationId: 30, userId: 7),
          isServerFormatError(),
        );
      });
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
    final body = responses[options.uri.path];
    if (!responses.containsKey(options.uri.path)) {
      return ResponseBody.fromString(
        jsonEncode({'message': 'not found'}),
        404,
        headers: {
          Headers.contentTypeHeader: [Headers.jsonContentType],
        },
      );
    }
    return ResponseBody.fromString(
      jsonEncode(body),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}
