# Contracts Agent Notes

## Scope

This package owns shared TypeScript contracts used by the web and mobile apps.

## Responsibilities

- Hold shared request and response contracts that are safe to reuse on the client side.
- Provide a stable place for future shared schema and DTO typing.

## Does not own

- Backend domain logic.
- Database schema.
- Web-only or mobile-only UI state.

## Key entrypoints

- `src/index.ts`: shared contract exports.

## Working rules

- Keep this package TypeScript-only and platform-agnostic.
- Prefer contracts that map cleanly to API payloads.
- Do not move server-only implementation details into this package.

## Validation

- `pnpm --filter @weunite/contracts typecheck`
- `pnpm --filter @weunite/contracts build`

## Keep this file updated when

- Shared client-facing contracts are added or reorganized.
- The ownership boundary between app-local types and shared contracts changes.
