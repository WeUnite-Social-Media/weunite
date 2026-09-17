import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/auth/data/auth_models.dart';

import '../fixtures/api_payloads.dart';

/// Verifies that the fixtures used across the test suite (and, by
/// extension, the DTOs that parse them) actually match the shapes declared
/// in the OpenAPI snapshot at `openapi/weunite-api.json`.
void main() {
  group('OpenAPI contract', () {
    test('UserDTO', () => expectMatchesSchema(userJson, 'UserDTO'));
    test(
      'UserSummaryDTO',
      () => expectMatchesSchema(userSummaryJson, 'UserSummaryDTO'),
    );
    test(
      'ResponseDTOLong',
      () => expectMatchesSchema(responseDto(3), 'ResponseDTOLong'),
    );
    test(
      'ResponseDTOAuthDTO',
      () => expectMatchesSchema(responseDto(authJson), 'ResponseDTOAuthDTO'),
    );
    test(
      'LoginRequestDTO',
      () => expectMatchesSchema(
        const LoginRequestDto(
          username: 'matheus',
          password: 'secret',
        ).toJson(),
        'LoginRequestDTO',
      ),
    );
    test(
      'CreateUserRequestDTO',
      () => expectMatchesSchema(
        const CreateUserRequestDto(
          name: 'Matheus Silva',
          username: 'matheus',
          email: 'matheus@example.com',
          password: 'secret',
          role: 'athlete',
        ).toJson(),
        'CreateUserRequestDTO',
      ),
    );

    group('paths used by the mobile app exist in the spec', () {
      const usedPaths = <String, String>{
        '/api/auth/login': 'post',
        '/api/auth/signup': 'post',
        '/api/auth/signup/company': 'post',
        '/api/posts/get': 'get',
        '/api/posts/create/{userId}': 'post',
        '/api/likes/toggleLike/{userId}/{postId}': 'post',
        '/api/comment/get/{postId}': 'get',
        '/api/comment/create': 'post',
        '/api/user/id/{id}': 'get',
        '/api/user/username/{username}': 'get',
        '/api/follow/followers/{userId}/count': 'get',
        '/api/follow/following/{userId}/count': 'get',
        '/api/follow/followAndUnfollow/{followerId}/{followedId}': 'post',
        '/api/opportunities/get': 'get',
        '/api/saved-opportunities/toggle/{athleteId}/{opportunityId}': 'post',
        '/api/subscriber/toggleSubscriber/{athleteId}/{opportunityId}': 'post',
        '/api/conversations/user/{userId}': 'get',
        '/api/conversations/{conversationId}/user/{userId}': 'get',
        '/api/conversations/{conversationId}/messages/{userId}': 'get',
      };

      for (final entry in usedPaths.entries) {
        test('${entry.value.toUpperCase()} ${entry.key}', () {
          final path = _paths[entry.key] as Map<String, dynamic>?;
          expect(path, isNotNull, reason: '${entry.key} missing from spec');
          expect(
            path!.containsKey(entry.value),
            isTrue,
            reason: '${entry.value} ${entry.key} missing from spec',
          );
        });
      }
    });
  });
}

final Map<String, dynamic> _spec = jsonDecode(
  File('openapi/weunite-api.json').readAsStringSync(),
) as Map<String, dynamic>;

final Map<String, dynamic> _schemas = (_spec['components']
    as Map<String, dynamic>)['schemas'] as Map<String, dynamic>;

final Map<String, dynamic> _paths = _spec['paths'] as Map<String, dynamic>;

/// Asserts that every key in [payload] is declared in the OpenAPI schema
/// named [schemaName], with a JSON type compatible with the value found.
void expectMatchesSchema(Object? payload, String schemaName) {
  final schema = _schemas[schemaName] as Map<String, dynamic>?;
  if (schema == null) {
    fail('Schema "$schemaName" not found in openapi spec');
  }
  _expectValueMatches(payload, schema, schemaName);
}

Map<String, dynamic> _resolve(Map<String, dynamic> schema) {
  final ref = schema[r'$ref'] as String?;
  if (ref == null) {
    return schema;
  }
  final name = ref.split('/').last;
  final target = _schemas[name] as Map<String, dynamic>?;
  if (target == null) {
    fail('Referenced schema "$name" not found in openapi spec');
  }
  return target;
}

void _expectValueMatches(
  Object? value,
  Map<String, dynamic> schema,
  String path,
) {
  if (value == null) {
    // `non_null` Jackson inclusion means nullable fields are simply absent
    // from real responses; a fixture may still exercise the null case.
    return;
  }
  final resolved = _resolve(schema);
  switch (value) {
    case String _:
      expect(resolved['type'], 'string', reason: path);
    case bool _:
      expect(resolved['type'], 'boolean', reason: path);
    case int _:
      expect(
        resolved['type'],
        anyOf('integer', 'number'),
        reason: path,
      );
    case double _:
      expect(resolved['type'], 'number', reason: path);
    case List _:
      expect(resolved['type'], 'array', reason: path);
      final items = resolved['items'] as Map<String, dynamic>?;
      if (items != null) {
        for (var i = 0; i < value.length; i++) {
          _expectValueMatches(value[i], items, '$path[$i]');
        }
      }
    case Map _:
      expect(resolved['type'], 'object', reason: path);
      final properties =
          resolved['properties'] as Map<String, dynamic>? ?? const {};
      for (final entry in value.entries) {
        final key = entry.key as String;
        expect(
          properties.containsKey(key),
          isTrue,
          reason: 'Unexpected key "$key" at $path, '
              'not declared in schema properties',
        );
        _expectValueMatches(
          entry.value,
          properties[key] as Map<String, dynamic>,
          '$path.$key',
        );
      }
    default:
      fail('Unsupported payload value type ${value.runtimeType} at $path');
  }
}
