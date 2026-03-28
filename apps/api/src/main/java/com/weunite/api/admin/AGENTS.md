# API Admin Agent Notes

## Scope

This module owns admin-only backend operations in `com.weunite.api.admin`.

## Responsibilities

- Expose admin-only API handlers grouped by use case.
- Keep use-case orchestration isolated between stats, reports, and moderation.

## Does not own

- Public reporting submission flows.
- Web admin UI.
- Shared exception and config infrastructure.

## Key entrypoints

- `stats/controller/AdminStatsController.java`
- `reports/controller/AdminReportsController.java`
- `moderation/controller/AdminModerationController.java`

## Working rules

- Keep admin endpoints separate from public feature endpoints.
- Keep single-responsibility boundaries by use case folder:
  - `stats/*` only for dashboard and admin metrics.
  - `reports/*` only for report analysis/actions and content moderation operations.
  - `moderation/*` only for account moderation actions (ban/suspend).
- Depend on reporting and other feature modules for data, not the other way around.
- Avoid creating cross-use-case facade services that mix responsibilities.
- Name admin routes after the action they actually perform so clients and reviewers can infer behavior from the contract.
- Keep admin-only comments and response copy ASCII-safe or valid UTF-8.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Admin use-case boundaries or entrypoints change.
- A new admin use case folder is added or removed.
