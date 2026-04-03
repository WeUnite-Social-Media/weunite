# Packages Agent Notes

## Scope

This folder owns shared workspace packages under `packages/`.

## Responsibilities

- Hold reusable contracts and shared lint/typescript tooling.
- Keep package boundaries clear between runtime contracts and developer tooling.

## Does not own

- App runtime code.
- Backend business logic.
- Stable documentation or local infrastructure files.

## Key entrypoints

- `contracts/`
- `eslint-config/`
- `typescript-config/`

## Working rules

- Keep packages reusable across apps instead of coupling them to one consumer.
- Put shared API/web/mobile contract shapes in `contracts/`.
- Put workspace lint and TypeScript defaults in tooling packages, not app folders.

## Validation

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

## Keep this file updated when

- A package is added, removed, or changes responsibility.
- Shared package boundaries shift between runtime and tooling concerns.
