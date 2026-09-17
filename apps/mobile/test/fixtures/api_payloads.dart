/// Raw JSON payloads mirroring the API's real DTOs, used across data-source,
/// repository and contract tests instead of ad hoc maps.
library;

/// `UserSummaryDTO` (openapi: components.schemas.UserSummaryDTO).
const Map<String, Object?> userSummaryJson = {
  'id': '7',
  'name': 'Matheus Silva',
  'username': 'matheus',
  'profileImg': 'https://example.com/avatar.png',
};

/// `UserDTO` (openapi: components.schemas.UserDTO).
const Map<String, Object?> userJson = {
  'id': '7',
  'name': 'Matheus Silva',
  'username': 'matheus',
  'role': 'ATHLETE',
  'email': 'matheus@example.com',
  'bio': 'Atleta profissional',
  'isPrivate': false,
  'createdAt': '2026-01-10T09:00:00Z',
  'skills': <Object?>[],
};

/// Wraps [data] as the API's generic `ResponseDTO<T>` envelope.
Map<String, Object?> responseDto(Object? data) => {
      'message': 'ok',
      'data': data,
    };

/// `AuthDTO` (openapi: components.schemas.AuthDTO) as returned by login.
const Map<String, Object?> authJson = {
  'user': userJson,
  'jwt': 'token',
  'expiresIn': 3600000,
};
