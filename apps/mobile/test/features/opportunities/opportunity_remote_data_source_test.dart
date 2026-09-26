import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/opportunities/data/opportunity_remote_data_source.dart';

void main() {
  group('OpportunityRemoteDataSource.createOpportunity', () {
    test(
        'POSTs a multipart "opportunity" JSON part to '
        '/opportunities/create/{companyId}', () async {
      final adapter = _CapturingAdapter();
      final dataSource = OpportunityRemoteDataSource(_dio(adapter));

      await dataSource.createOpportunity(
        companyId: 7,
        title: 'Peneira sub-20',
        description: 'Vaga para lateral esquerdo',
        location: 'Sao Paulo, SP',
        dateEnd: DateTime(2026, 12, 1),
        skills: ['Velocidade', 'Passe'],
      );

      final request = adapter.requests.single;
      expect(request.method, 'POST');
      expect(request.path, '/api/opportunities/create/7');
      expect(request.body, contains('name="opportunity"'));
      expect(request.body, contains('content-type: application/json'));
      expect(
        request.body,
        contains(
          '{"title":"Peneira sub-20","description":"Vaga para lateral '
          'esquerdo","location":"Sao Paulo, SP","dateEnd":"2026-12-01",'
          '"skills":[{"name":"Velocidade"},{"name":"Passe"}]}',
        ),
      );
    });

    test('formats dateEnd as yyyy-MM-dd, zero-padded', () async {
      final adapter = _CapturingAdapter();
      final dataSource = OpportunityRemoteDataSource(_dio(adapter));

      await dataSource.createOpportunity(
        companyId: 1,
        title: 'T',
        description: 'D',
        location: 'L',
        dateEnd: DateTime(2027, 1, 5),
        skills: const [],
      );

      expect(adapter.requests.single.body, contains('"dateEnd":"2027-01-05"'));
    });

    test('drops blank skills instead of sending empty names', () async {
      final adapter = _CapturingAdapter();
      final dataSource = OpportunityRemoteDataSource(_dio(adapter));

      await dataSource.createOpportunity(
        companyId: 1,
        title: 'T',
        description: 'D',
        location: 'L',
        dateEnd: DateTime(2027, 1, 5),
        skills: ['Velocidade', '   ', ''],
      );

      expect(
        adapter.requests.single.body,
        contains('"skills":[{"name":"Velocidade"}]'),
      );
    });

    test('maps a server error to a friendly AppException', () async {
      final adapter = _CapturingAdapter(statusCode: 500);
      final dataSource = OpportunityRemoteDataSource(_dio(adapter));

      await expectLater(
        dataSource.createOpportunity(
          companyId: 7,
          title: 'T',
          description: 'D',
          location: 'L',
          dateEnd: DateTime(2027, 1, 5),
          skills: const [],
        ),
        throwsA(isA<AppException>()),
      );
    });
  });
}

Dio _dio(HttpClientAdapter adapter) {
  return Dio(BaseOptions(baseUrl: 'http://localhost/api'))
    ..httpClientAdapter = adapter;
}

class _CapturedRequest {
  const _CapturedRequest(this.method, this.path, this.body);

  final String method;
  final String path;
  final String body;
}

class _CapturingAdapter implements HttpClientAdapter {
  _CapturingAdapter({this.statusCode = 200});

  final int statusCode;
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
        _normalizeHeaders(latin1.decode(bytes)),
      ),
    );
    return ResponseBody.fromString(
      jsonEncode({'message': statusCode == 200 ? 'ok' : 'erro no servidor'}),
      statusCode,
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
