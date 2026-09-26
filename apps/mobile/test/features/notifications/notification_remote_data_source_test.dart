import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/notifications/data/notification_models.dart';
import 'package:weunite_mobile/features/notifications/data/notification_remote_data_source.dart';

void main() {
  test('getNotifications parses the raw array, no envelope', () async {
    final payload = [
      {
        'id': 1,
        'userId': 7,
        'type': 'POST_LIKE',
        'actorId': 2,
        'actorName': 'Bob',
        'actorUsername': 'bob',
        'actorProfileImg': null,
        'relatedEntityId': 10,
        'message': 'Bob curtiu seu post',
        'isRead': false,
        'createdAt': '2026-09-26T10:00:00Z',
      },
    ];
    final adapter = _CapturingAdapter(response: payload);
    final dataSource = NotificationRemoteDataSource(_dio(adapter));

    final notifications = await dataSource.getNotifications(7);

    expect(notifications, hasLength(1));
    expect(notifications.single.type, NotificationTypeDto.postLike);
    expect(notifications.single.isRead, isFalse);
    expect(adapter.requests.single.path, '/api/notifications/user/7');
    expect(adapter.requests.single.method, 'GET');
  });

  test('an unknown backend type falls back to unknown instead of throwing',
      () async {
    final payload = [
      {
        'id': 1,
        'userId': 7,
        'type': 'SOMETHING_NEW',
        'actorId': 2,
        'actorName': 'Bob',
        'actorUsername': 'bob',
        'relatedEntityId': 10,
        'message': 'msg',
        'isRead': false,
        'createdAt': '2026-09-26T10:00:00Z',
      },
    ];
    final adapter = _CapturingAdapter(response: payload);
    final dataSource = NotificationRemoteDataSource(_dio(adapter));

    final notifications = await dataSource.getNotifications(7);

    expect(notifications.single.type, NotificationTypeDto.unknown);
  });

  test('getUnreadCount reads the raw {unreadCount} object, no envelope',
      () async {
    final adapter = _CapturingAdapter(response: {'unreadCount': 5});
    final dataSource = NotificationRemoteDataSource(_dio(adapter));

    final count = await dataSource.getUnreadCount(7);

    expect(count, 5);
    expect(
      adapter.requests.single.path,
      '/api/notifications/user/7/unread-count',
    );
  });

  test('markAsRead PUTs to /notifications/{id}/read', () async {
    final adapter = _CapturingAdapter();
    final dataSource = NotificationRemoteDataSource(_dio(adapter));

    await dataSource.markAsRead(42);

    expect(adapter.requests.single.method, 'PUT');
    expect(adapter.requests.single.path, '/api/notifications/42/read');
  });

  test('markAllAsRead PUTs to /notifications/user/{userId}/read-all', () async {
    final adapter = _CapturingAdapter();
    final dataSource = NotificationRemoteDataSource(_dio(adapter));

    await dataSource.markAllAsRead(7);

    expect(adapter.requests.single.method, 'PUT');
    expect(
      adapter.requests.single.path,
      '/api/notifications/user/7/read-all',
    );
  });

  test('delete DELETEs /notifications/{id}', () async {
    final adapter = _CapturingAdapter();
    final dataSource = NotificationRemoteDataSource(_dio(adapter));

    await dataSource.delete(42);

    expect(adapter.requests.single.method, 'DELETE');
    expect(adapter.requests.single.path, '/api/notifications/42');
  });
}

Dio _dio(HttpClientAdapter adapter) {
  return Dio(BaseOptions(baseUrl: 'http://localhost/api'))
    ..httpClientAdapter = adapter;
}

class _CapturedRequest {
  const _CapturedRequest(this.method, this.path);

  final String method;
  final String path;
}

class _CapturingAdapter implements HttpClientAdapter {
  _CapturingAdapter({this.response});

  final Object? response;
  final requests = <_CapturedRequest>[];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(_CapturedRequest(options.method, options.uri.path));
    return ResponseBody.fromString(
      jsonEncode(response ?? {'message': 'ok'}),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}
