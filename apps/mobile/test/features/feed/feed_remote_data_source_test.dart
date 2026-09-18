import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/network/image_media_type.dart';
import 'package:weunite_mobile/features/feed/data/feed_remote_data_source.dart';

import '../../fixtures/api_payloads.dart';

void main() {
  group('FeedRemoteDataSource.createPost', () {
    late Directory tempDir;

    setUp(() => tempDir = Directory.systemTemp.createTempSync('weunite_post'));
    tearDown(() => tempDir.deleteSync(recursive: true));

    test('sends the image as a typed "image" part next to the post JSON',
        () async {
      final image = File('${tempDir.path}/foto.png')
        ..writeAsBytesSync([137, 80, 78, 71]);
      final adapter = _CapturingAdapter();
      final dataSource = FeedRemoteDataSource(_dio(adapter));

      await dataSource.createPost(
        userId: 7,
        content: 'Com foto',
        imagePath: image.path,
      );

      final request = adapter.requests.single;
      expect(request.method, 'POST');
      expect(request.path, '/api/posts/create/7');
      expect(request.body, contains('name="post"'));
      expect(request.body, contains('{"text":"Com foto"}'));
      expect(request.body, contains('name="image"; filename="foto.png"'));
      expect(request.body, contains('content-type: image/png'));
    });

    test('omits the image part when no image was picked', () async {
      final adapter = _CapturingAdapter();
      final dataSource = FeedRemoteDataSource(_dio(adapter));

      await dataSource.createPost(userId: 7, content: 'So texto');

      final body = adapter.requests.single.body;
      expect(body, contains('name="post"'));
      expect(body, isNot(contains('name="image"')));
    });
  });

  test('getUserPosts reads the author posts list', () async {
    final adapter = _CapturingAdapter(response: [feedPostSummaryJson]);
    final dataSource = FeedRemoteDataSource(_dio(adapter));

    final posts = await dataSource.getUserPosts(userId: 7, page: 1);

    expect(posts, hasLength(1));
    final request = adapter.requests.single;
    expect(request.path, '/api/posts/get/user/7');
    expect(request.query, containsPair('page', '1'));
  });

  test('imageMediaTypeFor maps common extensions and defaults to jpeg', () {
    expect(imageMediaTypeFor('a.PNG').toString(), 'image/png');
    expect(imageMediaTypeFor('a.webp').toString(), 'image/webp');
    expect(imageMediaTypeFor('a.jpg').toString(), 'image/jpeg');
    expect(imageMediaTypeFor('sem_extensao').toString(), 'image/jpeg');
  });
}

Dio _dio(HttpClientAdapter adapter) {
  return Dio(BaseOptions(baseUrl: 'http://localhost/api'))
    ..httpClientAdapter = adapter;
}

class _CapturedRequest {
  const _CapturedRequest(this.method, this.path, this.query, this.body);

  final String method;
  final String path;
  final Map<String, String> query;
  final String body;
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
    final bytes = <int>[];
    if (requestStream != null) {
      await for (final chunk in requestStream) {
        bytes.addAll(chunk);
      }
    }
    requests.add(
      _CapturedRequest(
        options.method,
        options.uri.path,
        options.uri.queryParameters,
        _normalizeHeaders(latin1.decode(bytes)),
      ),
    );
    return ResponseBody.fromString(
      jsonEncode(response ?? {'message': 'ok'}),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  /// Multipart header names are case-insensitive; compare them lower-cased
  /// without touching the JSON payload.
  String _normalizeHeaders(String body) {
    return body.replaceAllMapped(
      RegExp(r'^content-type:', caseSensitive: false, multiLine: true),
      (_) => 'content-type:',
    );
  }

  @override
  void close({bool force = false}) {}
}
