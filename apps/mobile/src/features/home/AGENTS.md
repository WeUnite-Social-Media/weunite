## Scope

This feature owns the current mobile home shell in `apps/mobile/src/features/home`.

## Responsibilities

- Render the first mobile landing screen while core navigation and auth are still being introduced.
- Present upcoming mobile feature areas such as feed, profile, and opportunities.
- Keep the initial screen lightweight and safe for Expo Go testing.

## Does not own

- Expo Router route files.
- Shared theme tokens, layout primitives, or runtime config.
- Backend business rules.

## Key entrypoints

- `screens/HomeScreen.tsx`

## Working rules

- Keep this feature focused on the initial mobile shell until real feed/navigation work lands.
- Move reusable cards, layout wrappers, or theme values to `../../shared`.

## Validation

- `pnpm --filter @weunite/mobile lint`
- `pnpm --filter @weunite/mobile typecheck`
- `pnpm --filter @weunite/mobile build`

## Keep this file updated when

- The home shell becomes a real feed or discovery feature.
- Screen ownership moves into another mobile feature.
