## Scope

This feature owns web authentication, signup, password recovery, and verification flows in `apps/web/src/features/auth`.

## Responsibilities

- Render login, signup, email verification, and password reset pages.
- Hold auth-specific API adapters, validation schemas, hooks, and browser auth state.
- Expose the feature route tree used by the app shell.

## Does not own

- Backend authentication rules or token issuance.
- App-level route guards outside the auth feature.
- Shared primitives used by the rest of the app.

## Key entrypoints

- `routes/AuthRoutes.tsx`
- `pages/Index.tsx`
- `pages/VerifyEmail.tsx`
- `pages/VerifyResetToken.tsx`
- `pages/SendResetPassword.tsx`
- `pages/ResetPassword.tsx`
- `api/authService.ts`
- `stores/useAuthStore.ts`

## Validation

- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web typecheck`
- `pnpm --filter @weunite/web build`

## Keep this file updated when

- Auth routes or page ownership changes.
- Browser auth state moves between feature and app scope.
- Verification or recovery flows gain new entrypoints.
