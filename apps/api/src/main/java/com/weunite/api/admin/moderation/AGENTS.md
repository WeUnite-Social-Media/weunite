# API Admin Moderation Agent Notes

## Scope

This module owns account moderation actions in `com.weunite.api.admin.moderation`.

## Responsibilities

- Expose admin endpoints for user ban/suspension.
- Execute account moderation rules and related report resolution side-effects.
- Keep moderation request DTOs and service logic.

## Does not own

- Report content listing/detail endpoints.
- Dashboard metric aggregation.
- Public user profile management flows.

## Key entrypoints

- `controller/AdminModerationController.java`
- `service/AdminModerationService.java`
- `dto/*`

## Core use cases

- Ban user permanently.
- Suspend user for a time window.
- Resolve related reports for moderation actions.

## Working rules

- Keep account moderation orchestration in this use case folder.
- Keep request DTOs dedicated to moderation use cases.
- Preserve existing `/api/admin/users/**` contracts unless explicitly requested.
- Keep moderation service comments and response text ASCII-safe or valid UTF-8.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Moderation endpoint contracts change.
- Ban/suspend ownership moves between modules.
