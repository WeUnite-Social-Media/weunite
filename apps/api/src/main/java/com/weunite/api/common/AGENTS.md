# API Common Agent Notes

## Scope

This module owns cross-cutting backend infrastructure in `com.weunite.api.common`.

## Responsibilities

- Provide shared config, security, validation, error handling, and response models.
- Provide shared integrations like mail and storage.
- Keep reusable backend primitives used by feature modules.

## Does not own

- Feature-specific business rules (posts, users, chat, reports, etc.).
- Feature endpoint orchestration.

## Key entrypoints

- `config/*`
- `security/*`
- `handler/*`
- `validation/*`
- `mail/*`
- `storage/*`
- `response/*`

## Core use cases

- Centralize security and request validation primitives.
- Standardize API response and exception handling.
- Share infrastructure adapters for integrations.

## Working rules

- Keep this module generic and dependency-light.
- Do not move feature-specific DTOs/services into `common`.
- Prefer extension/composition by feature modules over tight coupling.
- Keep database bootstrap and legacy schema/data normalization in `config/*` when the fix is cross-cutting and must run before feature traffic.
- Keep runtime bootstrap limited to data normalization; route schema DDL through versioned database migrations instead of `CommandLineRunner`.
- Keep startup-time schema/data normalization idempotent across repeated boots; never rely on one-time DDL side effects.
- Keep shared authenticated-actor helpers in `security/*` when controllers must validate that a
  path or query user id matches the JWT identity.
- Default personal-data, report-review, notification, and admin routes to authenticated access in `SecurityConfig` unless a public contract is explicitly required.

## Validation

- `pnpm --filter @weunite/api lint`
- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Cross-cutting infrastructure ownership changes.
- Shared security/validation/handler contracts change.
