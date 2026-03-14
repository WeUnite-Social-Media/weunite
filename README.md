# WeUnite Monorepo

WeUnite is a social platform that connects athletes, companies, opportunities, and community interaction through one shared monorepo.

## Repo shape

- `apps/web`: Vite + React web client.
- `apps/api`: Spring Boot API.
- `apps/mobile`: Expo mobile shell and future mobile app.
- `packages/contracts`: placeholder shared TypeScript contracts for web and mobile.
- `packages/eslint-config`: shared flat ESLint config package.
- `packages/typescript-config`: shared TypeScript config package.
- `docs`: stable repository docs that belong in Git.
- `tmp`: local-only planning and runtime space. This directory is ignored by Git.

## Core commands

- `pnpm install`: install workspace dependencies.
- `pnpm dev:infra`: start local Postgres.
- `pnpm dev`: start the web and api apps together.
- `pnpm dev:web`: start only the web app.
- `pnpm dev:api`: start only the api app.
- `pnpm dev:mobile`: start the mobile shell.
- `pnpm lint`: run workspace lint checks.
- `pnpm typecheck`: run workspace type checks.
- `pnpm test`: run workspace tests.
- `pnpm build`: build the workspace.
- `pnpm check`: run lint, typecheck, test, and build in sequence.

## Environment

- Web uses `VITE_API_URL` and falls back to `/api` for local proxy-based development.
- Mobile uses `EXPO_PUBLIC_API_URL`.
- API uses the variables documented in [apps/api/.env.example](apps/api/.env.example).

## Documentation model

- `AGENTS.md`: ownership, boundaries, commands, and maintenance rules.
- `docs/`: stable shared docs for the team and remote repository.
- `tmp/`: local working notes, progress logs, and runtime logs.

Start with [AGENTS.md](AGENTS.md) for repository-wide guidance.
