# API Auth Agent Notes

## Scope

This module owns authentication and session-related API flows in `com.weunite.api.auth`.

## Responsibilities

- Expose authentication endpoints for login and token lifecycle.
- Coordinate credential validation and token issuing through auth services.

## Does not own

- User profile CRUD.
- Authorization policy definitions from `common/security`.
- Non-auth business domains.

## Key entrypoints

- `controller/AuthController.java`
- `service/AuthService.java`

## Core use cases

- Authenticate user credentials.
- Issue and refresh access context.
- Return auth payloads aligned with existing API contracts.

## Working rules

- Keep auth controller thin and delegate business logic to service.
- Preserve auth response contracts unless a product/API change is explicit.
- Reuse shared security components from `common`, do not duplicate.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Auth endpoints or payload contracts change.
- Token/session strategy ownership changes.
