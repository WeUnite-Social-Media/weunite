## Scope

This folder owns cross-feature web code in `apps/web/src/shared`.

## Responsibilities

- Hold reusable UI primitives, shared layout components, hooks, utilities, providers, and type definitions.
- Provide the shared HTTP client and generic browser-side helpers used by multiple features.
- Keep shared code stable and framework-local to the web app.

## Does not own

- Feature-specific pages, stores, and workflows.
- App bootstrap and route composition from `../app`.
- Backend business logic or persistence rules.

## Key entrypoints

- `api/http.ts`
- `api/health.ts`
- `components/ui/*`
- `components/shared/*`
- `hooks/*`
- `providers/ThemeProvider.tsx`
- `types/*`
- `schemas/common/*`
- `lib/*`
- `utils/*`

## Working rules

- Keep shared code generic and reusable across multiple features.
- Leave feature-specific API adapters, validation, and business state in the owning feature folder.
- Prefer `components/ui` for base primitives and `components/shared` for composed cross-feature shells.
- Keep shared auth/admin helpers derived from normalized user data and stable API contracts.

## Validation

- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web typecheck`
- `pnpm --filter @weunite/web build`

## Keep this file updated when

- Shared UI or helper ownership changes.
- A new shared sub-area becomes a stable entrypoint for features.
- Generic code moves between `shared` and a feature folder.
