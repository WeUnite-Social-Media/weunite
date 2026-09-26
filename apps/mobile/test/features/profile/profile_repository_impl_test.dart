import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/session/current_user_provider.dart';
import 'package:weunite_mobile/features/profile/data/profile_remote_data_source.dart';
import 'package:weunite_mobile/features/profile/data/profile_repository_impl.dart';

import '../../fixtures/api_payloads.dart';

void main() {
  group('ProfileRepositoryImpl.getProfile', () {
    test('fetches the user and both follow counts concurrently', () async {
      final repository = ProfileRepositoryImpl(
        remoteDataSource: ProfileRemoteDataSource(
          _dio({
            '/api/user/id/7': _Response(responseDto(userJson)),
            '/api/follow/followers/7/count': _Response(responseDto(3)),
            '/api/follow/following/7/count': _Response(responseDto(5)),
          }),
        ),
        currentUserProvider: _FakeCurrentUserProvider(7),
      );

      final profile = await repository.getProfile(7);

      expect(profile.followersCount, 3);
      expect(profile.followingCount, 5);
    });

    test('rethrows as AppException when a follow count request fails',
        () async {
      final repository = ProfileRepositoryImpl(
        remoteDataSource: ProfileRemoteDataSource(
          _dio({
            '/api/user/id/7': _Response(responseDto(userJson)),
            '/api/follow/followers/7/count': _Response(null, statusCode: 500),
            '/api/follow/following/7/count': _Response(responseDto(5)),
          }),
        ),
        currentUserProvider: _FakeCurrentUserProvider(7),
      );

      await expectLater(
        () => repository.getProfile(7),
        throwsA(isA<AppException>()),
      );
    });
  });

  group('ProfileRepositoryImpl.getProfileByUsername', () {
    test(
        'looks the user up by username, then fetches follow counts for '
        'its id', () async {
      final repository = ProfileRepositoryImpl(
        remoteDataSource: ProfileRemoteDataSource(
          _dio({
            '/api/user/username/matheus': _Response(responseDto(userJson)),
            '/api/follow/followers/7/count': _Response(responseDto(3)),
            '/api/follow/following/7/count': _Response(responseDto(5)),
          }),
        ),
        currentUserProvider: _FakeCurrentUserProvider(7),
      );

      final profile = await repository.getProfileByUsername('matheus');

      expect(profile.id, 7);
      expect(profile.followersCount, 3);
      expect(profile.followingCount, 5);
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

class _Response {
  const _Response(this.body, {this.statusCode = 200});

  final Object? body;
  final int statusCode;
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
