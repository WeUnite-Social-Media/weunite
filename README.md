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
- pnpm 10.x available locally. Recommended: run `corepack enable` once and use the pinned workspace version (`pnpm@10.6.3`).
- Java 17+.
- PostgreSQL 15+ locally or through Docker.
- Docker and Docker Compose are optional, but useful for local infrastructure.

Helpful installers and version managers:

- Node.js: [nodejs.org](https://nodejs.org/) or a version manager such as [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm).
- Java 17: [Eclipse Temurin 17](https://adoptium.net/temurin/releases/?version=17).
- PostgreSQL: [postgresql.org/download](https://www.postgresql.org/download/).
- Docker Desktop: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/).

## Quick start

All workspace scripts should be run from the repository root: `weunite/`.

If you are inside `apps/api` or `apps/web`, go back to the root first:

- Windows PowerShell: `cd ..\..`
- macOS/Linux: `cd ../..`

### Local native PostgreSQL

1. Go to the repository root:

   ```powershell
   cd /path/to/your/weunite-repository
   ```

2. If `pnpm` is not available yet, enable Corepack through as a root terminal and confirm the pinned version:

   ```powershell
   corepack enable
   corepack pnpm --version
   ```

3. Install dependencies:

   ```powershell
   corepack pnpm install
   ```

4. Create the local env files:

   Windows PowerShell:

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   Copy-Item apps/web/.env.example apps/web/.env
   ```

   macOS/Linux:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

5. Fill in `apps/api/.env` and `apps/web/.env`.

   Minimum local values to review:
   - `apps/web/.env`: keep `VITE_API_URL=http://localhost:8080/api` for the default local API.
   - `apps/api/.env`: if you are using the default local setup, keep `DB_HOST=localhost`, `DB_PORT=5432`, `DB_NAME=weunite`, and `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173`.
   - `apps/api/.env`: set `DB_USERNAME` and `DB_PASSWORD` to your local PostgreSQL credentials.
   - `apps/api/.env`: `MAIL_USERNAME`, `MAIL_PASSWORD`, and `MAIL_PORT` only need to exist for the API to boot locally; the placeholder values from `.env.example` are fine until you test email flows.
   - `apps/api/.env`: `CLOUDINARY_URL` only needs a valid placeholder format until you test image upload flows.
   - `apps/api/.env`: `JWT_PUBLIC_KEY` and `JWT_PRIVATE_KEY` must be real base64-encoded full RSA PEM values; `corepack pnpm dev:infra:local` validates them before startup.

6. Create the PostgreSQL database referenced by `DB_NAME` in `apps/api/.env` (`weunite` by default):

   ```bash
   createdb weunite
   ```

   Alternative with `psql`:

   ```bash
   psql -U postgres -c "CREATE DATABASE weunite;"
   ```

7. Run the local preflight:

   ```powershell
   corepack pnpm dev:infra:local
   ```

8. Start web and api:

   ```powershell
   corepack pnpm dev
   ```

### Local with Docker

1. Go to the repository root.
2. If `pnpm` is not available yet, run `corepack enable` once and confirm it with `corepack pnpm --version`.
3. Install dependencies with `corepack pnpm install`.
4. Create the local env files:

   Windows PowerShell:

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   Copy-Item apps/web/.env.example apps/web/.env
   ```

   macOS/Linux:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

5. Start the bundled PostgreSQL container:

   ```powershell
   corepack pnpm dev:infra
   ```

   The Docker workflow already provisions PostgreSQL, so you do not need to create the database manually.

6. Start web and api:

   ```powershell
   corepack pnpm dev
   ```

- Web: `http://localhost:5173`
- API: `http://localhost:8080/api`

## Core commands

- `corepack pnpm install`: install workspace dependencies.
- `corepack pnpm dev:infra`: start local Postgres.
- `corepack pnpm dev:infra:local`: validate the native PostgreSQL local setup.
- `corepack pnpm dev:api:docker`: start the API and PostgreSQL together in Docker.
- `corepack pnpm dev:api:docker:down`: stop the dockerized API stack.
- `corepack pnpm dev`: start the web and api apps together.
- `corepack pnpm dev:web`: start only the web app.
- `corepack pnpm dev:api`: start only the api app.
- `corepack pnpm dev:mobile`: start the mobile shell.
- `corepack pnpm lint`: run workspace lint checks.
- `corepack pnpm typecheck`: run workspace type checks.
- `corepack pnpm test`: run workspace tests.
- `corepack pnpm build`: build the workspace.
- `corepack pnpm check`: run lint, typecheck, test, and build in sequence.

## Environment

- Web uses `VITE_API_URL` and falls back to `/api` for local proxy-based development.
- Mobile uses `EXPO_PUBLIC_API_URL`.
- API uses the variables documented in [apps/api/.env.example](apps/api/.env.example).
- Dockerized API setup and localhost networking are documented in [docs/docker-java-localhost.md](docs/docker-java-localhost.md).

## CI and merge requirements

- `.github/workflows/ci.yml` runs workspace lint, typecheck, test, and build jobs.
- `.github/workflows/pr-quality.yml` runs focused web and API validation on pull requests to `main`.
- Recommended protected branch checks are `validate`, `frontend`, `backend`, and `copilot-review`.

## Documentation model

- `AGENTS.md`: ownership, boundaries, commands, and maintenance rules.
- `docs/`: stable shared docs for the team and remote repository.
- `tmp/`: local working notes, progress logs, and runtime logs.

Start with [AGENTS.md](AGENTS.md) for repository-wide guidance.
