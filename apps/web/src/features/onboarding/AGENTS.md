## Scope

This feature owns first-login onboarding on the web client, including the intro modal, guided tour flow, and user-scoped persistence for whether the onboarding has already been seen.

## Responsibilities

- Decide when onboarding should appear for an authenticated user.
- Render the first-login prompt and guided tour UI.
- Persist onboarding completion state in the browser per user.

## Does not own

- Auth state itself.
- Sidebar or page layout ownership.
- Backend-managed product education rules.

## Key entrypoints

- `components/OnboardingController.tsx`
- `components/FirstLoginModal.tsx`
- `components/GuidedTourModal.tsx`
- `hooks/useFirstLogin.ts`
- `constants/tourSteps.ts`
- `state/useOnboardingStore.ts`

## Validation

- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web typecheck`
- `pnpm --filter @weunite/web build`

## Keep this file updated when

- The onboarding trigger rules change.
- The tour gains new step ownership.
- Onboarding persistence stops being browser-local.
