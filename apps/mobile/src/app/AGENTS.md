## Scope

This area owns the Expo Router bootstrap and route composition in `apps/mobile/src/app`.

## Responsibilities

- Hold route files and app-level layouts.
- Compose feature-owned screens into mobile routes.
- Keep global navigation setup close to Expo Router conventions.

## Does not own

- Feature-specific UI, state, hooks, or API adapters.
- Shared UI primitives, theme tokens, runtime config, or cross-feature helpers.
- Backend business logic.

## Key entrypoints

- `_layout.tsx`: root stack layout.
- `index.tsx`: current first route for the mobile shell.

## Working rules

- Keep route files thin and delegate real screen content to `../features`.
- Add route groups only when navigation needs them.
- Keep app-wide providers here once they are introduced.

## Validation

- `pnpm --filter @weunite/mobile lint`
- `pnpm --filter @weunite/mobile typecheck`
- `pnpm --filter @weunite/mobile build`

## Keep this file updated when

- Mobile route ownership changes.
- App-level providers or navigation groups are introduced.
