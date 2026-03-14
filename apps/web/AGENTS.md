# Web Agent Notes

## Scope

This package owns the Vite + React web client in `apps/web`.

## Responsibilities

- Render the main web routes for auth, feed, profile, opportunities, chat, admin, and reporting flows.
- Hold browser-side auth state, route composition, shared UI primitives, and the web API client.
- Consume the Spring API through HTTP and websocket flows.

## Does not own

- Server-side business rules.
- Database access.
- Mobile-specific runtime behavior.

## Key entrypoints

- `src/app/main.tsx`: browser bootstrap.
- `src/app/App.tsx`: top-level route composition.
- `src/app/routes/*`: route guards and app-level routing helpers.
- `src/features/*`: feature-owned UI, state, hooks, and route modules.
- `src/shared/api/http.ts`: shared web HTTP client.
- `vite.config.ts`: local dev proxy and alias setup.

## Working rules

- Keep route URLs stable unless the product explicitly changes them.
- Prefer feature-local code under `src/features` and keep only generic primitives under `src/shared`.
- Use `VITE_API_URL` when the app must talk to a non-proxied API host.
- Keep the web app as a client of `apps/api`.
- Do not recreate legacy root-level buckets under `src` such as `pages`, `hooks`, `routes`, `state`, `utils`, `schemas`, `contexts`, `components`, or `api`.
- Keep app bootstrap concerns in `src/app`, feature ownership in `src/features`, and reusable cross-feature code in `src/shared`.

## Validation

- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web typecheck`
- `pnpm --filter @weunite/web build`

## Keep this file updated when

- Route ownership changes.
- Feature boundaries change.
- Shared UI or API client responsibilities move.
