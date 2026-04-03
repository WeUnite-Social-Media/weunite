# API Admin Moderation Agent Notes

## Scope

This module owns account moderation actions in `com.weunite.api.admin.moderation`.

## Responsibilities

- Expose admin endpoints for user listing, reactivation, ban, and suspension.
- Execute account moderation rules and related report resolution side-effects.
- Keep moderation request and summary DTOs plus service logic.

## Does not own

- Report content listing/detail endpoints.
- Dashboard metric aggregation.
- Public user profile management flows.

## Key entrypoints

- `controller/AdminModerationController.java`
- `service/AdminModerationService.java`
- `dto/*`

## Core use cases

- List users with moderation-ready summary data for the admin web.
- Ban user permanently.
- Suspend user for a time window.
- Reactivate suspended or banned users.
- Resolve related reports for moderation actions.

## Working rules

- Keep account moderation orchestration in this use case folder.
- Keep request DTOs dedicated to moderation use cases.
- Preserve existing `/api/admin/users/**` contracts unless explicitly requested.
- Keep moderation service comments and response text ASCII-safe or valid UTF-8.
- Derive the acting admin from authenticated JWT context instead of trusting request-body ids.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Moderation or admin user endpoint contracts change.
- User summary payloads or reactivation behavior change.
- Ban/suspend ownership moves between modules.
