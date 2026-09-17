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

/// `FeedPostSummaryDTO` (openapi: components.schemas.FeedPostSummaryDTO).
/// No `repostedBy`/`repostedAt`, mirroring `non_null` omission.
const Map<String, Object?> feedPostSummaryJson = {
  'id': '10',
  'text': 'Treino aberto hoje',
  'imageUrl': 'https://example.com/post.png',
  'likesCount': 3,
  'commentsCount': 1,
  'likedByViewer': true,
  'createdAt': '2026-09-15T12:00:00Z',
  'user': userSummaryJson,
};

/// `CommentDTO` (openapi: components.schemas.CommentDTO). No `comments`,
/// which is absent from the spec (see plan D2) but not consumed anyway.
const Map<String, Object?> commentJson = {
  'id': '4',
  'user': userJson,
  'text': 'Boa!',
  'createdAt': '2026-09-15T12:20:00Z',
};

/// `OpportunityDTO` (openapi: components.schemas.OpportunityDTO).
Map<String, Object?> get opportunityJson => {
      'id': 4,
      'title': 'Peneira sub-20',
      'description': 'Selecao para atletas',
      'location': 'Sao Paulo',
      'dateEnd': '2026-10-01',
      'skills': [
        {'id': 1, 'name': 'Velocidade'},
        {'id': 2, 'name': 'Passe'},
      ],
      'company': {...userJson, 'role': 'COMPANY'},
      'subscribersCount': 12,
    };
