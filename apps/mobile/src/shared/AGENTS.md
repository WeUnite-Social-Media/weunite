## Scope

This folder owns reusable mobile code in `apps/mobile/src/shared`.

## Responsibilities

- Hold reusable mobile UI primitives, layout helpers, theme tokens, runtime config, hooks, types, and utilities.
- Provide cross-feature mobile infrastructure without coupling to one feature.
- Keep mobile shared code framework-local to React Native and Expo.

## Does not own

- Feature-specific screens, state, hooks, or API adapters.
- Expo Router route composition from `../app`.
- Backend business logic.

## Key entrypoints

- `components/`: reusable mobile UI and layout pieces.
- `config/env.ts`: Expo-safe runtime config parsing.
- `theme/tokens.ts`: design tokens that can later map to NativeWind/Tailwind config.

## Working rules

- Keep shared primitives generic and reusable across multiple mobile features.
- Keep feature-specific API adapters inside the owning feature.
- Prefer tokenized colors, spacing, radius, and type values over raw values in screens.

## Validation

- `pnpm --filter @weunite/mobile lint`
- `pnpm --filter @weunite/mobile typecheck`
- `pnpm --filter @weunite/mobile build`

## Keep this file updated when

- Shared mobile primitives, config, or theme ownership changes.
- A new shared sub-area becomes a stable entrypoint.
