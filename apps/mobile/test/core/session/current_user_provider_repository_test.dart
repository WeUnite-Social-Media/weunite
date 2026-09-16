import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/config/app_config.dart';
import 'package:weunite_mobile/core/session/current_user_provider.dart';
import 'package:weunite_mobile/core/storage/token_storage.dart';
import 'package:weunite_mobile/features/chat/data/chat_remote_data_source.dart';
import 'package:weunite_mobile/features/chat/data/chat_repository_impl.dart';
import 'package:weunite_mobile/features/feed/data/feed_remote_data_source.dart';
import 'package:weunite_mobile/features/feed/data/feed_repository_impl.dart';
import 'package:weunite_mobile/features/profile/data/profile_remote_data_source.dart';
import 'package:weunite_mobile/features/profile/data/profile_repository_impl.dart';

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
        remoteDataSource: ProfileRemoteDataSource(_dio(recorder)),
        currentUserProvider: _FakeCurrentUserProvider(15),
      );

      await repository.getMyProfile();

      expect(recorder.lastPath, '/api/user/id/15');
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

      expect(recorder.lastPath, '/api/follow/followAndUnfollow/11/99');
    });

    test(
        'ChatRepositoryImpl.getConversations fetches conversations for the '
        'id from CurrentUserProvider', () async {
      final recorder = _RequestRecorder();
      final repository = ChatRepositoryImpl(
        remoteDataSource: ChatRemoteDataSource(
          _dio(recorder, response: const <Object?>[]),
        ),
        config: const AppConfig(
          apiBaseUrl: 'http://localhost/api',
          websocketBaseUrl: 'http://localhost/ws',
        ),
        tokenStorage: _FakeTokenStorage(),
        currentUserProvider: _FakeCurrentUserProvider(23),
      );

      await repository.getConversations();

      expect(recorder.lastPath, '/api/conversations/user/23');
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

class _FakeTokenStorage implements TokenStorage {
  @override
  Future<String?> readAccessToken() async => null;

  @override
  Future<String?> readRefreshToken() async => null;

  @override
  Future<String?> readUserJson() async => null;

  @override
  Future<DateTime?> readAccessTokenExpiresAt() async => null;

  @override
  Future<void> saveTokens({
    required String accessToken,
    String? refreshToken,
    DateTime? expiresAt,
  }) async {}

  @override
  Future<void> saveUserJson(String userJson) async {}

  @override
  Future<void> clear() async {}
}

class _RequestRecorder {
  RequestOptions? lastOptions;

  String? get lastPath => lastOptions?.uri.path;
}

Dio _dio(
  _RequestRecorder recorder, {
  Object? response = const <String, Object?>{},
}) {
  return Dio(BaseOptions(baseUrl: 'http://localhost/api'))
    ..httpClientAdapter = _RecordingAdapter(recorder, response);
}

class _RecordingAdapter implements HttpClientAdapter {
  _RecordingAdapter(this._recorder, this._response);

  final _RequestRecorder _recorder;
  final Object? _response;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    _recorder.lastOptions = options;
    return ResponseBody.fromString(
      jsonEncode(_response),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}
