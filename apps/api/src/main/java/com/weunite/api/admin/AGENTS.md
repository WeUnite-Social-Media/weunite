# API Admin Agent Notes

## Scope

This module owns admin-only backend operations in `com.weunite.api.admin`.

## Responsibilities

- Expose admin-only API handlers.
- Orchestrate moderation and admin management actions that do not belong to public feature modules.

## Does not own

- Public reporting submission flows.
- Web admin UI.
- Shared exception and config infrastructure.

## Key entrypoints

- `controller/AdminController.java`
- `service/AdminService.java`

## Working rules

- Keep admin endpoints separate from public feature endpoints.
- Depend on reporting and other feature modules for data, not the other way around.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Admin endpoint responsibilities change.
- Moderation orchestration moves between admin and reporting modules.
