# Web Admin Agent Notes

## Scope

This area owns the web admin and moderation surfaces in `src/features/admin`.

## Responsibilities

- Render admin dashboard, user management, reporting, and moderation views.
- Hold admin-specific API adapters, UI components, and local stores.

## Does not own

- Core report persistence rules.
- API-side moderation business rules.
- Shared UI primitives used by the rest of the app.

## Key entrypoints

- `components/*`: admin UI building blocks.
- `pages/*`: admin route pages.
- `routes/AdminRoutes.tsx`: admin route tree.
- `api/*`: admin-specific API calls.

## Working rules

- Keep admin-only concerns inside this feature.
- Reuse `src/shared/components/ui` for primitives instead of duplicating base components.
- Keep API-side moderation logic in `apps/api`.
- Keep dashboard and user-management screens consuming `/api/admin/...` data instead of local mocks.
- Keep admin user-management lists paginated; avoid loading every user when the screen opens.
- Gate admin-only screens from normalized authenticated `user.role` data instead of local email allowlists.

## Validation

- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web typecheck`

## Keep this file updated when

- Admin routes change.
- Moderation responsibilities shift between web and api.
- Admin-specific API boundaries change.
- Dashboard or user-management integration contracts change.
