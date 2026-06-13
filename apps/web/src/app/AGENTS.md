## Scope

This area owns web bootstrap, top-level providers, and route guards in `apps/web/src/app`.

## Responsibilities

- Bootstrap the browser app and global CSS.
- Compose top-level route guards and public/private route shells.
- Hold app-wide providers that features consume, such as websocket transport bootstrap.

## Does not own

- Feature-specific pages, stores, and business flows.
- Reusable shared UI primitives.
- Backend auth or websocket authorization rules.

## Key entrypoints

- `main.tsx`
- `App.tsx`
- `App.css`
- `index.css`
- `routes/PrivateRoutes.tsx`
- `routes/PublicRoutes.tsx`
- `providers/WebSocketProvider.tsx`
- `providers/useAppWebSocket.ts`
- `providers/ApiHealthProvider.tsx`
- `providers/apiHealthContext.ts`

## Working rules

- Keep this folder focused on composition and bootstrap, not feature business logic.
- Put cross-feature reusable code in `../shared` and feature-specific code in `../features`.
- Keep route guard behavior aligned with normalized auth state rather than duplicating feature logic in the app shell.

## Validation

- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web typecheck`
- `pnpm --filter @weunite/web build`

## Keep this file updated when

- App bootstrap or provider ownership changes.
- Route guard responsibilities move between app and features.
- A new top-level provider or app entrypoint is added.
