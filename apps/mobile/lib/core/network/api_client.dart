import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../error/app_exception.dart';
import '../storage/token_storage.dart';

class ApiClient {
  ApiClient({
    required AppConfig config,
    required TokenStorage tokenStorage,
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
        _tokenStorage = tokenStorage {
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
          if (statusCode == 401) {
            final refreshed = await _tryRefreshToken();
            if (refreshed) {
              final nextToken = await _tokenStorage.readAccessToken();
              if (nextToken != null && nextToken.isNotEmpty) {
                error.requestOptions.headers['Authorization'] =
                    'Bearer $nextToken';
              }
              final response = await dio.fetch<dynamic>(error.requestOptions);
              handler.resolve(response);
              return;
            }
            await _tokenStorage.clear();
          }
          handler.next(error);
        },
      ),
    );
  }

  final Dio dio;
  final TokenStorage _tokenStorage;

  Future<bool> _tryRefreshToken() async {
    final refreshToken = await _tokenStorage.readRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      return false;
    }

    try {
      final response = await Dio(dio.options).post<Map<String, dynamic>>(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      final data = response.data?['data'] as Map<String, dynamic>? ??
          response.data ??
          {};
      final accessToken =
          data['jwt']?.toString() ?? data['accessToken']?.toString();
      final nextRefreshToken = data['refreshToken']?.toString();
      if (accessToken == null || accessToken.isEmpty) {
        return false;
      }
      await _tokenStorage.saveTokens(
        accessToken: accessToken,
        refreshToken: nextRefreshToken ?? refreshToken,
      );
      return true;
    } catch (_) {
      return false;
    }
  }
}

AppException mapDioError(Object error) {
  if (error is DioException) {
    final responseData = error.response?.data;
    final message = responseData is Map<String, dynamic>
        ? responseData['message']?.toString() ??
            responseData['error']?.toString()
        : null;

    return AppException(
      message ?? error.message ?? 'Erro ao conectar com o servidor.',
      statusCode: error.response?.statusCode,
    );
  }

  return AppException(error.toString());
}
