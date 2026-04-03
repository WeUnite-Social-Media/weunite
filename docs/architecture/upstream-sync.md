# Upstream Sync Runbook

## Objective

Keep the monorepo aligned with the legacy repositories without reintroducing the old folder structure or breaking the current `AGENTS.md` boundaries.

## Sources Of Truth

- Current product code lives in this monorepo.
- Legacy behavior to compare against lives in:
  - `https://github.com/mathessoliv/weunite-frontend`
  - `https://github.com/mathessoliv/weunite-backend`
- Local throwaway comparison notes belong in `tmp/`, not in tracked docs.

## Update Cadence

- Run a sync review whenever a legacy repository receives a meaningful feature, fix, or UX improvement that is not yet present here.
- Do a broader parity pass before releases that touch auth, opportunities, admin, moderation, reporting, chat, or notifications.

## Recommended Workflow

1. Refresh local upstream clones or comparison copies inside `tmp/`.
2. Compare one domain at a time, starting from user-facing flows.
3. Write a short gap list in `tmp/` with:
   - missing endpoints
   - missing UI actions
   - contract mismatches
   - validation or copy regressions
4. Import changes in small waves with a single domain owner each time.
5. Re-home imported code into the current monorepo structure instead of copying legacy folders as-is.
6. Validate each wave before starting the next one.

## Import Rules

- Preserve current module ownership:
  - backend logic stays in `apps/api`
  - web logic stays in `apps/web`
  - shared TS contracts stay in `packages/contracts` when they are truly shared
- Prefer importing behavior, contracts, and UX details over importing legacy architecture.
- Treat DTOs and frontend types as contracts that must stay explicit and serialization-safe.
- When legacy code returns DTOs and the monorepo returns entities, align to DTOs.
- When legacy UX includes validation feedback, counters, or visibility controls, keep those details during the migration.

## Validation Checklist

- Web:
  - `pnpm --filter @weunite/web lint`
  - `pnpm --filter @weunite/web typecheck`
- API:
  - `pnpm --filter @weunite/api build`
  - `pnpm --filter @weunite/api test`
- Manually sanity-check the migrated flow end-to-end when the feature is user-facing.

## Done Criteria

A sync wave is complete only when:

- the missing legacy behavior exists in the monorepo
- the implementation follows the local `AGENTS.md` boundaries
- the affected web and api validations pass
- any lasting workflow change is reflected in `docs/`

## Keep This Updated When

- The legacy repositories change meaningfully.
- The sync workflow, cadence, or validation commands change.
- A new recurring gap pattern appears that should become part of the standard checklist.
