## Scope

This folder owns feature-local mobile code in `apps/mobile/src/features`.

## Responsibilities

- Group mobile screens, components, hooks, state, and API adapters by product feature.
- Keep mobile feature boundaries aligned with the web/app domain model where it makes sense.
- Provide a stable place for real mobile features without recreating root-level buckets.

## Does not own

- Expo Router route files from `../app`.
- Generic mobile UI primitives, theme tokens, runtime config, and cross-feature helpers from `../shared`.
- Backend business logic.

## Key entrypoints

- `home/`: current mobile shell and discovery starting point.

## Working rules

- Keep business-specific screen code inside the owning feature.
- Promote code to `../shared` only when it is reused across features.
- Keep feature API adapters aligned with `apps/api` contracts.
- Add a child `AGENTS.md` when a feature gains non-obvious ownership or entrypoints.

## Validation

- `pnpm --filter @weunite/mobile lint`
- `pnpm --filter @weunite/mobile typecheck`
- `pnpm --filter @weunite/mobile build`

## Keep this file updated when

- A mobile feature is added, removed, or renamed.
- Boundaries shift between a feature and `app` or `shared`.
