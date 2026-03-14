# API Reports Agent Notes

## Scope

This module owns report creation, report queries, and reporting-related data structures in `com.weunite.api.reports`.

## Responsibilities

- Store and expose user-submitted reports.
- Provide report DTOs, repository access, and reporting services used by moderation flows.

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

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Reporting payloads or endpoints change.
- Moderation/report ownership shifts.
