# Apps Agent Notes

## Scope

This folder owns the runnable applications under `apps/`.

## Responsibilities

- Route work to the correct app-specific area (`api`, `web`, `mobile`).
- Keep app-level boundaries clear between backend, web, and mobile clients.
- Hold only app directories, not shared workspace packages or repo-wide docs.

## Does not own

- Shared TypeScript contracts or workspace tooling packages.
- Stable architecture/runbook docs.
- Local infrastructure manifests.

## Key entrypoints

- `api/`
- `web/`
- `mobile/`

## Working rules

- Read the child app `AGENTS.md` before editing inside an app.
- Keep business logic in `apps/api`; web and mobile should consume the API instead of duplicating domain rules.
- Promote code to `packages/` only when it is truly shared across apps.

## Validation

- `pnpm dev`
- `pnpm dev:web`
- `pnpm dev:api`
- `pnpm dev:mobile`

## Keep this file updated when

- An app is added, removed, or renamed.
- App ownership boundaries change.
