## Scope

This folder owns feature-local web code in `apps/web/src/features`.

## Responsibilities

- Group UI, routes, state, hooks, and API adapters by product feature.
- Keep ownership boundaries clear between feature code, app bootstrap, and shared primitives.
- Provide a stable place for adding new web features without recreating root-level buckets.

## Does not own

- Browser bootstrap and top-level providers from `../app`.
- Generic shared UI, types, utilities, and HTTP plumbing from `../shared`.
- Backend business logic.

## Key entrypoints

- `admin/`
- `auth/`
- `chat/`
- `feed/`
- `legal/`
- `notifications/`
- `onboarding/`
- `opportunities/`
- `profile/`
- `reporting/`

## Working rules

- Keep business-specific state and components inside the owning feature.
- Promote code to `../shared` only when it is genuinely reused across features.
- Keep feature API adapters aligned with `apps/api` contracts instead of inventing parallel client-only business rules.
- Add or update a child `AGENTS.md` when a feature gains non-obvious boundaries or new owned entrypoints.

## Validation

- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web typecheck`
- `pnpm --filter @weunite/web build`

## Keep this file updated when

- A feature is added, removed, or renamed.
- Boundaries shift between a feature and `app` or `shared`.
- Feature routing ownership changes.
