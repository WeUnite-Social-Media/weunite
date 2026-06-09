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
- pnpm 10.x available locally. Recommended: run `corepack enable` once and use the pinned workspace version from `package.json`.
- Java 17+.
- Docker Desktop with Docker Compose.
- PostgreSQL 15+ only if you intentionally want to run a native database. The default development flow uses PostgreSQL in Docker.

Helpful installers and version managers:

- Node.js: [nodejs.org](https://nodejs.org/) or a version manager such as [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm).
- Java 17: [Eclipse Temurin 17](https://adoptium.net/temurin/releases/?version=17).
- PostgreSQL: [postgresql.org/download](https://www.postgresql.org/download/).
- Docker Desktop: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/).

## Quick Start

All workspace scripts should be run from the repository root: `weunite/`.

If you are inside `apps/api` or `apps/web`, go back to the root first:

- Windows PowerShell: `cd ..\..`
- macOS/Linux: `cd ../..`

### Docker-First Local Setup

1. Go to the repository root:

   ```powershell
   cd /path/to/your/weunite-repository
   ```

2. If `pnpm` is not available yet, enable Corepack once and confirm the pinned version:

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

   Minimum Docker-first values to review:
   - `apps/web/.env`: keep `VITE_API_URL=http://localhost:8080`. The web client adds `/api` internally for HTTP calls.
   - `apps/web/.env`: keep `VITE_WS_URL=http://localhost:8080/ws`.
   - `apps/web/.env`: keep `VITE_MEDIA_URL=http://localhost:8080`.
   - `apps/api/.env`: for the default Docker database, keep `DB_USERNAME=postgres` and `DB_PASSWORD=postgres`.
   - `apps/api/.env`: `DB_HOST`, `DB_PORT`, and `DB_NAME` can be omitted or kept as `localhost`, `5432`, and `weunite` when the API runs locally. When the API runs in Docker, Compose injects `DB_HOST=db`.
   - `apps/api/.env`: keep `CORS_ALLOWED_ORIGINS=http://localhost:5173` or include it in the existing comma-separated list.
   - `apps/api/.env`: `MAIL_USERNAME`, `MAIL_PASSWORD`, and `MAIL_PORT` only need to exist for the API to boot locally; the placeholder values from `.env.example` are fine until you test email flows.
   - `apps/api/.env`: `CLOUDINARY_URL` only needs a valid placeholder format until you test image upload flows.
   - `apps/api/.env`: `JWT_PUBLIC_KEY` and `JWT_PRIVATE_KEY` must be real base64-encoded full RSA PEM values.

6. Start the database in Docker:

   ```powershell
   docker compose -f infra/docker/compose.dev.yml up -d db
   ```

7. Start the API and web locally:

   ```powershell
   corepack pnpm dev
   ```

- Web: `http://localhost:5173`
- API: `http://localhost:8080/api`
- PostgreSQL: `localhost:5432`

### Docker Development Modes

The development Compose file is [infra/docker/compose.dev.yml](infra/docker/compose.dev.yml). It always exposes host ports so the browser and local tools use the same addresses:

- PostgreSQL: `localhost:5432`
- API: `localhost:8080`
- Web: `localhost:5173`

The database service is named `db` inside Docker. That means:

- API running locally connects to PostgreSQL through `localhost:5432`.
- API running in Docker connects to PostgreSQL through `db:5432`.
- Web always calls `http://localhost:8080`, because the React code runs in the user's browser even when Vite is served from a container.

#### 1. Web local + API Docker + DB Docker

Start API and database in Docker:

```powershell
docker compose -f infra/docker/compose.dev.yml --profile api up --build db api
```

In another terminal, start the web app locally:

```powershell
corepack pnpm dev:web
```

Network behavior:

- Browser opens `http://localhost:5173`.
- Web calls `http://localhost:8080/api`.
- Host port `8080` forwards to the API container.
- API container talks to PostgreSQL at `db:5432`.

#### 2. Web Docker + API Docker + DB Docker

Start everything in Docker:

```powershell
docker compose -f infra/docker/compose.dev.yml --profile api --profile web up --build
```

Network behavior:

- Browser opens `http://localhost:5173`.
- Vite runs in Docker, but its port is published to the host.
- Web calls `http://localhost:8080/api`.
- API container talks to PostgreSQL at `db:5432`.

#### 3. Web Docker + API Local + DB Docker

Start web and database in Docker:

```powershell
docker compose -f infra/docker/compose.dev.yml --profile web up --build db web
```

In another terminal, start the API locally:

```powershell
corepack pnpm dev:api
```

Network behavior:

- Browser opens `http://localhost:5173`.
- Web container serves Vite through the published host port.
- Web calls the local API at `http://localhost:8080/api`.
- API local connects to PostgreSQL at `localhost:5432`.

#### 4. Web Local + API Local + DB Docker

Start only the database in Docker:

```powershell
docker compose -f infra/docker/compose.dev.yml up -d db
```

Start both apps locally:

```powershell
corepack pnpm dev
```

Network behavior:

- Browser opens `http://localhost:5173`.
- Web local calls API local at `http://localhost:8080/api`.
- API local connects to PostgreSQL at `localhost:5432`.

### Optional Native PostgreSQL

The recommended development flow keeps PostgreSQL in Docker. If you intentionally want a native PostgreSQL instance, create the database referenced by `DB_NAME` in `apps/api/.env` and run the local preflight:

```powershell
corepack pnpm dev:infra:local
```

Then start the local apps:

```powershell
corepack pnpm dev
```

## Core commands

- `corepack pnpm install`: install workspace dependencies.
- `corepack pnpm dev:infra`: start local Docker Postgres.
- `corepack pnpm dev:infra:local`: validate the native PostgreSQL local setup.
- `docker compose -f infra/docker/compose.dev.yml up -d db`: start only PostgreSQL in Docker.
- `docker compose -f infra/docker/compose.dev.yml --profile api up --build db api`: start PostgreSQL and API in Docker.
- `docker compose -f infra/docker/compose.dev.yml --profile web up --build db web`: start PostgreSQL and web in Docker.
- `docker compose -f infra/docker/compose.dev.yml --profile api --profile web up --build`: start PostgreSQL, API, and web in Docker.
- `docker compose -f infra/docker/compose.dev.yml down`: stop the Docker development stack.
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

- Web uses `VITE_API_URL` as the API origin. In Docker-first development, keep it as `http://localhost:8080`; the shared HTTP client appends `/api`.
- Mobile uses `EXPO_PUBLIC_API_URL`.
- API uses the variables documented in [apps/api/.env.example](apps/api/.env.example).
- API database configuration falls back to `localhost:5432/weunite`, so a local API can talk to the Docker database without changing code.
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
