import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../error/app_exception.dart';
import '../session/session_events.dart';
import '../storage/token_storage.dart';
import 'api_diagnostics.dart';

const _loginPath = '/auth/login';

class ApiClient {
  ApiClient({
    required AppConfig config,
    required TokenStorage tokenStorage,
    required SessionEvents sessionEvents,
  })  : dio = Dio(
          BaseOptions(
            baseUrl: config.apiBaseUrl,
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 20),
            sendTimeout: const Duration(seconds: 20),
            headers: const {
              Headers.acceptHeader: Headers.jsonContentType,
            },
          ),
        ),
        _tokenStorage = tokenStorage,
        _sessionEvents = sessionEvents {
    if (kDebugMode) dio.interceptors.add(ApiDiagnostics());
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStorage.readAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final statusCode = error.response?.statusCode;
          final isLoginRequest = error.requestOptions.path == _loginPath;
          if (statusCode == 401 && !isLoginRequest) {
            // TODO(api): implementar refresh quando /auth/refresh existir.
            // Quando existir, usar `options.extra['retried']` para evitar
            // loop de retry e compartilhar um unico Future de refresh entre
            // 401 simultaneos, em vez de expirar a sessao imediatamente.
            await _tokenStorage.clear();
            _sessionEvents.notifyExpired();
          }
          handler.next(error);
        },
      ),
    );
  }

  final Dio dio;
  final TokenStorage _tokenStorage;
  final SessionEvents _sessionEvents;
}

AppException mapDioError(Object error, [StackTrace? stackTrace]) {
  if (error is AppException) {
    return error;
  }
  final cause = error is DioException ? error.error : error;
  if (kDebugMode) {
    debugPrint('[API] Mapping failure: ${error.runtimeType}; '
        'cause=${cause.runtimeType}');
    if (stackTrace != null) {
      debugPrintStack(stackTrace: stackTrace, maxFrames: 8);
    }
  }
  if (cause is TypeError || cause is FormatException) {
    return const AppException('Resposta do servidor em formato inesperado.');
  }
  if (error is DioException) {
    final responseData = error.response?.data;
    final message = responseData is Map<String, dynamic>
        ? responseData['message']?.toString() ??
            responseData['error']?.toString()
        : null;

    final status = error.response?.statusCode;
    final fallback = switch (error.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.sendTimeout ||
      DioExceptionType.receiveTimeout =>
        'O servidor demorou para responder.',
      DioExceptionType.connectionError =>
        'Nao foi possivel conectar ao servidor.',
      DioExceptionType.badCertificate =>
        'Nao foi possivel validar a conexao segura.',
      DioExceptionType.cancel => 'Requisicao cancelada.',
      _ => switch (status) {
          401 => 'Sessao expirada. Entre novamente.',
          403 => 'Voce nao tem permissao para acessar este recurso.',
          404 => 'Recurso nao encontrado no servidor.',
          null => 'Nao foi possivel processar a resposta do servidor.',
          _ => 'O servidor retornou um erro (HTTP $status).',
        },
    };
    return AppException(message ?? fallback, statusCode: status);
  }

  return const AppException('Nao foi possivel processar os dados recebidos.');
}
