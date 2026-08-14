# Mobile Agent Notes

## Scope

This package owns the Expo mobile shell in `apps/mobile`.

## Responsibilities

- Hold the React Native mobile bootstrap and runtime configuration.
- Hold the Expo Router `src/app` shell for future mobile navigation, auth, and API integration.

## Does not own

- Backend business rules.
- Web-specific rendering logic.
- Shared config packages.

## Key entrypoints

- `package.json`: points Expo at `expo-router/entry`.
- `src/app/_layout.tsx`: Expo Router root stack layout.
- `src/app/index.tsx`: current mobile app shell screen.
- `src/features/home/screens/HomeScreen.tsx`: current mobile shell content.
- `src/shared/config/env.ts`: mobile runtime config parsing.
- `src/shared/theme/tokens.ts`: shared mobile design tokens.
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
