import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/auth/data/auth_remote_data_source.dart';

/// What each auth call puts on the wire. The club sign-up test is the
/// regression guard for the bug that made mobile registration impossible:
/// `/auth/signup/company` was called without a password, and
/// `CreateUserRequestDTO.password` is `@NotBlank @ValidPassword`.
void main() {
  group('AuthRemoteDataSource sign-up', () {
    test('the club sign-up sends a password and the bare CNPJ digits',
        () async {
      final adapter = _RecordingAdapter({
        '/api/auth/signup/company': {
          'message': 'Cadastro concluído! Verifique seu email',
          'data': {},
        },
      });
      final dataSource = AuthRemoteDataSource(_dio(adapter));

      final message = await dataSource.signUpCompany(
        name: 'Clube Teste',
        username: 'clubeteste',
        email: 'clube@provedor.com',
        cnpj: '11222333000181',
        password: 'Abcdefg1!',
      );

      final body = adapter.lastBody!;
      expect(body['password'], 'Abcdefg1!');
      expect(body['cnpj'], '11222333000181');
      expect(body['role'], 'company');
      expect(message, 'Cadastro concluído! Verifique seu email');
    });

    test('the athlete sign-up returns the API message', () async {
      final adapter = _RecordingAdapter({
        '/api/auth/signup': {
          'message': 'Cadastro concluído! Verifique seu email',
          'data': {},
        },
      });
      final dataSource = AuthRemoteDataSource(_dio(adapter));

      final message = await dataSource.signUpAthlete(
        name: 'Joao da Silva',
        username: 'joaosilva',
        email: 'joao@provedor.com',
        password: 'Abcdefg1!',
      );

      expect(adapter.lastBody!['role'], 'athlete');
      expect(adapter.lastBody!['cnpj'], isNull);
      expect(message, 'Cadastro concluído! Verifique seu email');
    });

    test('surfaces the backend password rule as the error message', () async {
      final dataSource = AuthRemoteDataSource(
        _dio(
          _RecordingAdapter(
            {
              '/api/auth/signup': {
                'password': 'A senha deve conter pelo menos um simbolo',
              },
            },
            statusCode: 400,
          ),
        ),
      );

      expect(
        () => dataSource.signUpAthlete(
          name: 'Joao da Silva',
          username: 'joaosilva',
          email: 'joao@provedor.com',
          password: 'Abcdefg1',
        ),
        throwsA(
          isA<AppException>().having(
            (error) => error.message,
            'message',
            'A senha deve conter pelo menos um simbolo',
          ),
        ),
      );
    });
  });

  group('AuthRemoteDataSource password recovery', () {
    test('sends the reset request and returns the API message', () async {
      final adapter = _RecordingAdapter({
        '/api/auth/send-reset-password': {
          'message': 'Código enviado!',
          'data': {},
        },
      });
      final dataSource = AuthRemoteDataSource(_dio(adapter));

      final message = await dataSource.sendResetPassword(
        email: 'joao@provedor.com',
      );

      expect(adapter.lastBody!['email'], 'joao@provedor.com');
      expect(message, 'Código enviado!');
    });

    test('puts the e-mail in the path when verifying the code', () async {
      final adapter = _RecordingAdapter({
        '/api/auth/verify-reset-token/joao%40provedor.com': {
          'message': 'Código verificado!',
          'data': {},
        },
      });
      final dataSource = AuthRemoteDataSource(_dio(adapter));

      final message = await dataSource.verifyResetToken(
        email: 'joao@provedor.com',
        verificationToken: '123456',
      );

      expect(adapter.lastBody!['verificationToken'], '123456');
      expect(message, 'Código verificado!');
    });

    test('puts the code in the path when setting the new password', () async {
      final adapter = _RecordingAdapter({
        '/api/auth/reset-password/123456': {
          'message': 'Senha redefinida!',
          'data': {},
        },
      });
      final dataSource = AuthRemoteDataSource(_dio(adapter));

      final message = await dataSource.resetPassword(
        verificationToken: '123456',
        newPassword: 'Abcdefg1!',
      );

      expect(adapter.lastBody!['newPassword'], 'Abcdefg1!');
      expect(message, 'Senha redefinida!');
    });

    test('an expired code surfaces the backend message', () async {
      final dataSource = AuthRemoteDataSource(
        _dio(
          _RecordingAdapter(
            {
              '/api/auth/verify-reset-token/joao%40provedor.com': {
                'message': 'Token expirado',
              },
            },
            statusCode: 400,
          ),
        ),
      );

      expect(
        () => dataSource.verifyResetToken(
          email: 'joao@provedor.com',
          verificationToken: '999999',
        ),
        throwsA(
          isA<AppException>().having(
            (error) => error.message,
            'message',
            'Token expirado',
          ),
        ),
      );
    });

    test('a response without a message does not fail the call', () async {
      final dataSource = AuthRemoteDataSource(
        _dio(_RecordingAdapter({'/api/auth/send-reset-password': {}})),
      );

      expect(
        await dataSource.sendResetPassword(email: 'joao@provedor.com'),
        isNull,
      );
    });
  });
}

Dio _dio(_RecordingAdapter adapter) {
  return Dio(
    BaseOptions(
      baseUrl: 'http://localhost/api',
      headers: const {Headers.acceptHeader: Headers.jsonContentType},
    ),
  )..httpClientAdapter = adapter;
}

/// Like the shared fake adapter in `test/api_data_sources_test.dart`, but it
/// keeps the request body so a test can assert what was actually sent.
class _RecordingAdapter implements HttpClientAdapter {
  _RecordingAdapter(this.responses, {this.statusCode = 200});

  final Map<String, Object?> responses;
  final int statusCode;
  Map<String, dynamic>? lastBody;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    final data = options.data;
    lastBody = data is Map<String, dynamic> ? data : null;
    final path = options.uri.path;
    if (!responses.containsKey(path)) {
      return ResponseBody.fromString(
        jsonEncode({'message': 'not found'}),
        404,
        headers: {
          Headers.contentTypeHeader: [Headers.jsonContentType],
        },
      );
    }
    return ResponseBody.fromString(
      jsonEncode(responses[path]),
      statusCode,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}
