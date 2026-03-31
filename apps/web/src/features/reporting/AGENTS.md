## Scope

This feature owns end-user content reporting surfaces on the web client in `apps/web/src/features/reporting`.

## Responsibilities

- Expose the report submission API adapter used by the web client.
- Render reusable report UI such as the report modal for posts, comments, and opportunities.

## Does not own

- Admin moderation dashboards or review actions.
- Backend report persistence, triage, or moderation outcomes.
- Generic modal primitives from shared UI.

## Key entrypoints

- `api/reportService.ts`
- `components/ReportModal.tsx`

## Validation

- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web typecheck`
- `pnpm --filter @weunite/web build`

## Keep this file updated when

- Reporting UI moves between feature and shared ownership.
- New end-user reporting entrypoints are added.
- Reporting contracts change in a way the web client must model locally.
