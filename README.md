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

## Tech snapshot

- Web: React, TypeScript, Vite, TanStack Query, Zustand, React Hook Form, and Zod.
- API: Java 17, Spring Boot 3, Spring Security, JPA + PostgreSQL, Cloudinary, mail, and WebSocket support.
- Tooling: pnpm workspaces, Turbo, Husky, and shared workspace config packages.

## Prerequisites

- Node.js 22 with Corepack enabled.
- Java 17+.
- PostgreSQL 15+ locally or through Docker.
- Docker and Docker Compose are optional, but useful for local infrastructure.

## Quick start

1. `corepack pnpm install`
2. Copy `apps/api/.env.example` to `apps/api/.env` and fill in the required values.
3. `corepack pnpm dev:infra`
4. `corepack pnpm dev`

- Web: `http://localhost:5173`
- API: `http://localhost:8080/api`

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

## CI and merge requirements

- `.github/workflows/ci.yml` runs workspace lint, typecheck, test, and build jobs.
- `.github/workflows/pr-quality.yml` runs focused web and API validation on pull requests to `main`.
- Recommended protected branch checks are `validate`, `frontend`, `backend`, and `copilot-review`.

## Documentation model

- `AGENTS.md`: ownership, boundaries, commands, and maintenance rules.
- `docs/`: stable shared docs for the team and remote repository.
- `tmp/`: local working notes, progress logs, and runtime logs.

Start with [AGENTS.md](AGENTS.md) for repository-wide guidance.
