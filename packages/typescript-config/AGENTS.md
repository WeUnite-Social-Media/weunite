# TypeScript Config Agent Notes

## Scope

This package owns shared TypeScript configuration presets for workspace TypeScript projects.

## Responsibilities

- Export common TS config baselines for web, mobile, and shared packages.
- Keep shared TS strictness and module settings aligned across the workspace.

## Does not own

- Package-specific path aliases.
- Java build configuration.

## Key entrypoints

- `base.json`: shared baseline.
- `react-app.json`: React app preset.
- `expo.json`: Expo app preset.
- `library.json`: shared package preset.

## Working rules

- Keep shared compiler defaults here.
- Let consuming packages add only the minimum local overrides they need.

## Validation

- `pnpm --filter @weunite/typescript-config build`

## Keep this file updated when

- Shared TypeScript defaults change.
- New presets are added for new workspace package types.
