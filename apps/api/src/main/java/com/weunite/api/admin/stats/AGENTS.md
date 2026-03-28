# API Admin Stats Agent Notes

## Scope

This module owns admin dashboard statistics in `com.weunite.api.admin.stats`.

## Responsibilities

- Expose admin stats endpoints.
- Compute and return aggregate dashboard metrics.
- Keep stats-specific DTOs and service logic.

## Does not own

- Report moderation workflows.
- User suspension/ban workflows.
- Public feature endpoints.

## Key entrypoints

- `controller/AdminDashboardController.java`
- `controller/AdminStatsController.java`
- `service/AdminStatsService.java`
- `dto/*`

## Core use cases

- Return general admin dashboard metrics.
- Return dashboard compatibility payloads for the web admin.
- Return monthly chart data.
- Return user type distribution.
- Return opportunities skill aggregation.

## Working rules

- Keep stats business rules in this use case only.
- Do not import moderation request DTOs or report moderation orchestration here.
- Preserve existing `/api/admin/stats/**` contracts unless explicitly requested.
- Keep dashboard stats DTOs compatible with current admin consumers; when a payload needs both bean getters and record-style accessors, preserve that compatibility in the DTO instead of reshaping controllers or services.
- Push large opportunity-skill aggregations down to repository/database queries instead of scanning all opportunities in service memory.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Stats endpoints or payloads change.
- Metrics ownership moves to another module.
