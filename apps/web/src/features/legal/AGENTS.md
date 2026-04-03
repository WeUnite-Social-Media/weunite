## Scope

This feature owns the web legal and policy surfaces that users can access without auth, such as terms-of-use pages and supporting modals.

## Responsibilities

- Render public legal pages and reusable legal content blocks.
- Provide auth-adjacent legal entrypoints like terms modals used during signup.
- Keep legal copy presentation consistent across modal and full-page views.

## Does not own

- Auth business rules or form validation.
- Backend policy enforcement.
- General-purpose shared UI primitives.

## Key entrypoints

- `pages/TermsOfUsePage.tsx`
- `components/TermsModal.tsx`
- `components/TermsOfUseArticle.tsx`
- `constants/termsOfUse.ts`

## Validation

- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web typecheck`
- `pnpm --filter @weunite/web build`

## Keep this file updated when

- New legal routes are added.
- Legal content ownership moves.
- Signup or other public flows start depending on new policy surfaces.
