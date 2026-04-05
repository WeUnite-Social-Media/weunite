# Mobile Agent Notes

## Scope

This package owns the Expo mobile shell in `apps/mobile`.

## Responsibilities

- Hold the React Native mobile bootstrap and runtime configuration.
- Prepare the workspace for future mobile navigation, auth, and API integration.

## Does not own

- Backend business rules.
- Web-specific rendering logic.
- Shared config packages.

## Key entrypoints

- `App.tsx`: current app shell.
- `src/lib/env.ts`: mobile runtime config parsing.
- `app.json`: Expo app config.

## Working rules

- Keep runtime config Expo-safe and rely on `EXPO_PUBLIC_*` values only.
- Keep this package lightweight until real mobile features land.
- Consume the API through explicit base URLs, not Vite proxy assumptions.

## Validation

- `pnpm --filter @weunite/mobile lint`
- `pnpm --filter @weunite/mobile typecheck`
- `pnpm --filter @weunite/mobile build`

## Keep this file updated when

- Navigation is introduced.
- Mobile auth/bootstrap changes.
- Runtime config rules change.
