import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/core/network/api_client.dart';

void main() {
  group('mapDioError', () {
    test('TypeError becomes a server-format AppException', () {
      final error = mapDioError(TypeError());

      expect(error, isA<AppException>());
      expect(error.message, contains('formato inesperado'));
    });

    test('FormatException becomes a server-format AppException', () {
      final error = mapDioError(const FormatException('bad shape'));

      expect(error.message, contains('formato inesperado'));
    });

    test(
        'ArgumentError (e.g. from \$enumDecode) becomes a server-format '
        'AppException', () {
      final error = mapDioError(ArgumentError('unknown enum value'));

      expect(error.message, contains('formato inesperado'));
    });

    test(
        'a DioException wrapping a FormatException becomes a server-format '
        'AppException', () {
      final dioError = DioException(
        requestOptions: RequestOptions(path: '/posts/get'),
        error: const FormatException('bad shape'),
      );

      final error = mapDioError(dioError);

      expect(error.message, contains('formato inesperado'));
    });

    test('a plain 404 DioException keeps the existing status message', () {
      final dioError = DioException(
        requestOptions: RequestOptions(path: '/posts/get'),
        response: Response<dynamic>(
          requestOptions: RequestOptions(path: '/posts/get'),
          statusCode: 404,
        ),
        type: DioExceptionType.badResponse,
      );

      final error = mapDioError(dioError);

      expect(error.statusCode, 404);
      expect(error.message, isNot(contains('formato inesperado')));
    });
  });
}
