import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/reporting/data/report_remote_data_source.dart';

void main() {
  test(
    'createReport POSTs to /reports/create/{userId} with the right body',
    () async {
      final adapter = _CapturingAdapter(
        response: {
          'message': 'Denúncia registrada com sucesso!',
          'data': {
            'id': '1',
            'type': 'POST',
            'entityId': 42,
            'reason': 'spam',
            'status': 'PENDING',
          },
        },
      );
      final dataSource = ReportRemoteDataSource(_dio(adapter));

      final message = await dataSource.createReport(
        userId: 7,
        type: 'POST',
        entityId: 42,
        reason: 'spam',
      );

      expect(message, 'Denúncia registrada com sucesso!');
      expect(adapter.requests.single.method, 'POST');
      expect(adapter.requests.single.path, '/api/reports/create/7');
      expect(adapter.requests.single.body, {
        'type': 'POST',
        'entityId': 42,
        'reason': 'spam',
      });
    },
  );

  test('createReport falls back to a null message when absent', () async {
    final adapter = _CapturingAdapter(
      response: {
        'data': {'id': '1'},
      },
    );
    final dataSource = ReportRemoteDataSource(_dio(adapter));

    final message = await dataSource.createReport(
      userId: 7,
      type: 'OPPORTUNITY',
      entityId: 5,
      reason: 'other',
    );

    expect(message, isNull);
  });

  test(
    'a response envelope missing "data" is mapped to a friendly AppException',
    () async {
      final adapter = _CapturingAdapter(
        response: {'message': 'Denúncia registrada com sucesso!'},
      );
      final dataSource = ReportRemoteDataSource(_dio(adapter));

      await expectLater(
        dataSource.createReport(
          userId: 7,
          type: 'POST',
          entityId: 42,
          reason: 'spam',
        ),
        throwsA(
          isA<AppException>().having(
            (error) => error.message,
            'message',
            'Resposta do servidor em formato inesperado.',
          ),
        ),
      );
    },
  );
}

Dio _dio(HttpClientAdapter adapter) {
  return Dio(BaseOptions(baseUrl: 'http://localhost/api'))
    ..httpClientAdapter = adapter;
}

class _CapturedRequest {
  const _CapturedRequest(this.method, this.path, this.body);

  final String method;
  final String path;
  final Object? body;
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
    requests.add(
      _CapturedRequest(options.method, options.uri.path, options.data),
    );
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
