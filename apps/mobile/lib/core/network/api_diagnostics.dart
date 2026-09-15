import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

/// Metadata only: never log headers, query values, or request/response bodies.
class ApiDiagnostics extends Interceptor {
  ApiDiagnostics({void Function(String)? log}) : _log = log ?? debugPrint;

  final void Function(String) _log;

  void _write(String message) {
    if (kDebugMode) {
      _log('[API] $message');
    }
  }

  String _route(RequestOptions options) =>
      '${options.method} ${options.uri.origin}${options.uri.path}';

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    _write('--> ${_route(options)}');
    handler.next(options);
  }

  @override
  void onResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) {
    final data = response.data;
    final shape = data is List
        ? 'List(${data.length})'
        : data is Map
            ? 'Object(${data.length} fields)'
            : '${data.runtimeType}';
    _write(
      '<-- ${response.statusCode} ${_route(response.requestOptions)} $shape',
    );
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    _write(
      'ERROR ${_route(err.requestOptions)} '
      'status=${err.response?.statusCode ?? "none"} '
      'type=${err.type.name} cause=${err.error.runtimeType}',
    );
    handler.next(err);
  }
}
