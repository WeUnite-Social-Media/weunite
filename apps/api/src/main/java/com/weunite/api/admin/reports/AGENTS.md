# API Admin Reports Agent Notes

## Scope

This module owns admin-side report analysis and moderation actions in `com.weunite.api.admin.reports`.

## Responsibilities

- Expose admin report detail/list endpoints.
- Coordinate content moderation actions based on reports.
- Resolve/dismiss/review report states.

## Does not own

- Report submission by public users.
- Dashboard metric aggregation.
- Account suspension/ban workflows.

## Key entrypoints

- `controller/AdminReportsController.java`
- `service/AdminReportService.java`

## Core use cases

- List/report details for posts, opportunities, and comments.
- Delete/restore reported content by admin action.
- Expose compatibility moderation actions for admin web clients when they map to the same report workflow.
- Transition report states (dismiss/review/resolve).

## Working rules

- Keep report moderation orchestration in this use case folder.
- Depend on `com.weunite.api.reports` for report domain/repository data.
- Preserve existing `/api/admin/**` report routes unless explicitly requested.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Report moderation endpoints or flows change.
- Ownership between `admin.reports` and `reports` modules changes.
