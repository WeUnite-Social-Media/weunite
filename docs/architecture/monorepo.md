# Monorepo Architecture

## Layout

- `apps/web`: Vite + React web app.
- `apps/api`: Spring Boot API.
- `apps/mobile`: Expo mobile shell.
- `packages/contracts`: shared TypeScript contracts for client apps.
- `packages/eslint-config`: shared flat ESLint config.
- `packages/typescript-config`: shared TypeScript config.
- `infra`: local infrastructure files.
- `docs`: stable shared docs.
- `tmp`: local-only plans and runtime logs.

## Ownership rules

- API owns business logic, persistence, integrations, and websocket behavior.
- Web and mobile are API clients.
- Shared frontend-only contracts live in `packages/contracts`.
- Shared tooling lives in the config packages.

## Source organization rules

- Web uses `src/app`, `src/features`, and `src/shared`.
- API uses `common` plus feature modules.
- AGENTS files document ownership and maintenance boundaries close to the code.

## Temporary versus stable docs

- Stable, team-facing docs belong in `docs/`.
- Local working plans and progress logs belong in `tmp/`.
- Generated or retrospective reports do not stay in the tracked repo.
