import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/session/current_user_provider.dart';
import 'package:weunite_mobile/features/chat/data/chat_models.dart';
import 'package:weunite_mobile/features/chat/data/chat_realtime_client.dart';
import 'package:weunite_mobile/features/chat/domain/entities/chat_realtime_event.dart';
import 'package:weunite_mobile/features/chat/data/chat_remote_data_source.dart';
import 'package:weunite_mobile/features/chat/data/chat_repository_impl.dart';
import 'package:weunite_mobile/features/feed/data/feed_remote_data_source.dart';
import 'package:weunite_mobile/features/feed/data/feed_repository_impl.dart';
import 'package:weunite_mobile/features/profile/data/profile_remote_data_source.dart';
import 'package:weunite_mobile/features/profile/data/profile_repository_impl.dart';

import '../../fixtures/api_payloads.dart';

void main() {
  group('repository id resolution', () {
    test(
        'FeedRepositoryImpl.toggleLike uses CurrentUserProvider, not a '
        'caller-supplied id', () async {
      final recorder = _RequestRecorder();
      final repository = FeedRepositoryImpl(
        remoteDataSource: FeedRemoteDataSource(_dio(recorder)),
        currentUserProvider: _FakeCurrentUserProvider(42),
      );

      await repository.toggleLike(postId: 7);

      expect(recorder.lastPath, '/api/likes/toggleLike/42/7');
    });

    test(
        'FeedRepositoryImpl.createComment sends the id from '
        'CurrentUserProvider as the userId query parameter', () async {
      final recorder = _RequestRecorder();
      final repository = FeedRepositoryImpl(
        remoteDataSource: FeedRemoteDataSource(_dio(recorder)),
        currentUserProvider: _FakeCurrentUserProvider(9),
      );

      await repository.createComment(postId: 3, content: 'Boa!');

      expect(recorder.lastOptions?.queryParameters['userId'], 9);
    });

    test(
        'ProfileRepositoryImpl.getMyProfile fetches the profile for the id '
        'from CurrentUserProvider', () async {
      final recorder = _RequestRecorder();
      final repository = ProfileRepositoryImpl(
        remoteDataSource: ProfileRemoteDataSource(
          _dio(
            recorder,
            responsesByPath: {
              '/api/user/id/15': responseDto({...userJson, 'id': '15'}),
              '/api/follow/followers/15/count': responseDto(0),
              '/api/follow/following/15/count': responseDto(0),
            },
          ),
        ),
        currentUserProvider: _FakeCurrentUserProvider(15),
      );

      await repository.getMyProfile();

      expect(
        recorder.paths,
        containsAll(<String>[
          '/api/user/id/15',
          '/api/follow/followers/15/count',
          '/api/follow/following/15/count',
        ]),
      );
    });

    test(
        'ProfileRepositoryImpl.toggleFollow uses CurrentUserProvider as '
        'the follower id', () async {
      final recorder = _RequestRecorder();
      final repository = ProfileRepositoryImpl(
        remoteDataSource: ProfileRemoteDataSource(_dio(recorder)),
        currentUserProvider: _FakeCurrentUserProvider(11),
      );

      await repository.toggleFollow(followedId: 99);

      // Toggles, then reads the resulting state back from the API.
      expect(
        recorder.paths,
        containsAllInOrder(<String>[
          '/api/follow/followAndUnfollow/11/99',
          '/api/follow/get/11/99',
        ]),
      );
    });

    test(
        'ChatRepositoryImpl.getConversations fetches conversations for the '
        'id from CurrentUserProvider', () async {
      final recorder = _RequestRecorder();
      final repository = ChatRepositoryImpl(
        remoteDataSource: ChatRemoteDataSource(
          _dio(recorder, response: const <Object?>[]),
        ),
        realtimeClient: _FakeChatRealtimeClient(),
        currentUserProvider: _FakeCurrentUserProvider(23),
      );

      await repository.getConversations();

      expect(recorder.lastPath, '/api/conversations/user/23');
    });

    test(
        'ChatRepositoryImpl.getMessages fetches messages for the id from '
        'CurrentUserProvider', () async {
      final recorder = _RequestRecorder();
      final repository = ChatRepositoryImpl(
        remoteDataSource: ChatRemoteDataSource(
          _dio(recorder, response: const <Object?>[]),
        ),
        realtimeClient: _FakeChatRealtimeClient(),
        currentUserProvider: _FakeCurrentUserProvider(23),
      );

      await repository.getMessages(conversationId: 30);

      expect(recorder.lastPath, '/api/conversations/30/messages/23');
    });

    test(
        'ChatRepositoryImpl.sendMessage passes senderId from '
        'CurrentUserProvider to the realtime client', () async {
      final fakeRealtimeClient = _FakeChatRealtimeClient();
      final repository = ChatRepositoryImpl(
        remoteDataSource: ChatRemoteDataSource(_dio(_RequestRecorder())),
        realtimeClient: fakeRealtimeClient,
        currentUserProvider: _FakeCurrentUserProvider(23),
      );

      await repository.sendMessage(conversationId: 30, content: 'Oi!');

      expect(fakeRealtimeClient.lastSenderId, 23);
      expect(fakeRealtimeClient.lastConversationId, 30);
      expect(fakeRealtimeClient.lastContent, 'Oi!');
    });
  });
}

class _FakeCurrentUserProvider implements CurrentUserProvider {
  _FakeCurrentUserProvider(this.currentUserId);

  @override
  final int? currentUserId;

  @override
  int requireUserId() => currentUserId!;
}

class _FakeChatRealtimeClient implements ChatRealtimeClient {
  int? lastSenderId;
  int? lastConversationId;
  String? lastContent;

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
  }) {
    lastConversationId = conversationId;
    lastSenderId = senderId;
    lastContent = content;
  }

  @override
  Future<void> disconnect() async {}
}

class _RequestRecorder {
  RequestOptions? lastOptions;
  final paths = <String>[];

  String? get lastPath => lastOptions?.uri.path;
}

Dio _dio(
  _RequestRecorder recorder, {
  Object? response = const <String, Object?>{},
  Map<String, Object?> responsesByPath = const {},
}) {
  return Dio(BaseOptions(baseUrl: 'http://localhost/api'))
    ..httpClientAdapter =
        _RecordingAdapter(recorder, response, responsesByPath);
}

class _RecordingAdapter implements HttpClientAdapter {
  _RecordingAdapter(
    this._recorder,
    this._defaultResponse,
    this._responsesByPath,
  );

  final _RequestRecorder _recorder;
  final Object? _defaultResponse;
  final Map<String, Object?> _responsesByPath;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    _recorder.lastOptions = options;
    _recorder.paths.add(options.uri.path);
    final body = _responsesByPath.containsKey(options.uri.path)
        ? _responsesByPath[options.uri.path]
        : _defaultResponse;
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
