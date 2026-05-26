# API Reports Agent Notes

## Scope

This module owns report creation, report queries, and reporting-related data structures in `com.weunite.api.reports`.

## Responsibilities

- Store and expose user-submitted reports.
- Provide report DTOs, repository access, and reporting services used by moderation flows.
- Expose report queue queries used by moderation surfaces.
- Own the typed `ReportTarget` value mapped to persisted report target columns.

## Does not own

- Admin UI rendering.
- Generic exception handling.
- Cross-cutting auth and persistence configuration.

## Key entrypoints

- `controller/ReportController.java`
- `domain/Report.java`
- `dto/*`
- `repository/ReportRepository.java`
- `service/ReportService.java`

## Working rules

- Keep report submission flows public and moderation resolution flows coordinated through the admin module.
- Keep report payload types here instead of leaking them into unrelated modules.
- Keep status-based report listing logic inside this module instead of duplicating it in admin.
- Keep report targets modeled through `ReportTarget` while preserving `type` and `entityId` in
  external DTO contracts.
- Use `ReportTarget` for single-target report repository lookups; keep split target parameters only
  where batched projections require independent ID collections.
- Keep `ReportDTO` response fields aligned with admin consumers, including lowercase status strings and resolution metadata when present.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Reporting payloads or endpoints change.
- Moderation/report ownership shifts.
