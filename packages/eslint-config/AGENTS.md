# ESLint Config Agent Notes

## Scope

This package owns shared flat ESLint configuration for workspace JavaScript and TypeScript apps.

## Responsibilities

- Export reusable ESLint configs for React and base TS projects.
- Keep shared lint rules centralized for web and mobile.

## Does not own

- App-specific lint overrides that only make sense in one package.
- Java or Maven quality tooling.

## Key entrypoints

- `base.js`: base TypeScript config.
- `react.js`: React app config.

## Working rules

- Keep configs small and reusable.
- Prefer shared defaults here and app-specific exceptions in the consuming app.

## Validation

- `pnpm --filter @weunite/eslint-config build`

## Keep this file updated when

- Shared lint behavior changes.
- New exported config presets are added.
