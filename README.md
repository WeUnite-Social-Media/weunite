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

4. Create the root local env file:

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env
   ```

5. Fill in `.env`.

   Minimum Docker-first values to review:
   - `VITE_API_URL=http://localhost:8080`. The web client adds `/api` internally for HTTP calls.
   - `VITE_WS_URL=http://localhost:8080/ws`.
   - `VITE_MEDIA_URL=http://localhost:8080`.
   - `WEB_HOST_PORT=3000`, because the Vite dev server is configured for port `3000`.
   - `API_HOST_PORT=8080`.
   - `API_ONLY_HOST_PORT=8081` if you use the dedicated API-only Docker stack and want it to coexist with a local API on `8080`.
   - `DB_PASSWORD` is the active password used when the API runs locally through Maven.
   - For local API + DB Docker, set `DB_PASSWORD` to the same value as `DB_DOCKER_PASSWORD`.
   - For local API + native PostgreSQL, set `DB_PASSWORD` to the same value as `DB_LOCAL_PASSWORD`.
   - `DB_DOCKER_PASSWORD` is used by Compose when it creates the PostgreSQL container and when the Dockerized API connects to that container.
   - `DB_LOCAL_PASSWORD` is used by the Dockerized API when it connects to PostgreSQL running natively on the host.
   - `DB_HOST`, `DB_PORT`, and `DB_NAME` can stay as `localhost`, `5432`, and `weunite` when the API runs locally. Compose overrides database connection values when the API runs in Docker.
   - Keep `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173` or include your custom local web ports in the comma-separated list.
   - `MAIL_USERNAME`, `MAIL_PASSWORD`, and `MAIL_PORT` only need to exist for the API to boot locally; the placeholder values from `.env.example` are fine until you test email flows.
   - `CLOUDINARY_URL` only needs a valid placeholder format until you test image upload flows.
   - `JWT_PUBLIC_KEY` and `JWT_PRIVATE_KEY` must be real base64-encoded full RSA PEM values.

6. Start the database in Docker:

   ```powershell
   corepack pnpm dev:infra
   ```

7. Start the API and web locally:

   ```powershell
   corepack pnpm dev
   ```

- Web: `http://localhost:3000`
- API: `http://localhost:8080/api`
- PostgreSQL: `localhost:5432`

### Docker Development Modes

The development Compose file is [infra/docker/compose.dev.yml](infra/docker/compose.dev.yml). It always exposes host ports so the browser and local tools use the same addresses:

- PostgreSQL: `localhost:5432`
- API: `localhost:8080`
- Web: `localhost:3000`

The database service is named `db` inside Docker. That means:

- API running locally connects to PostgreSQL through `localhost:5432`.
- API running in Docker connects to PostgreSQL through `db:5432`.
- Web always calls `http://localhost:8080`, because the React code runs in the user's browser even when Vite is served from a container.

#### DB Docker scenarios

Use these when PostgreSQL should run in Docker.

| Scenario                            | Commands                                                     |
| ----------------------------------- | ------------------------------------------------------------ |
| Web local + API local + DB Docker   | `corepack pnpm dev:infra`, then `corepack pnpm dev`          |
| Web local + API Docker + DB Docker  | `corepack pnpm dev:docker:api`, then `corepack pnpm dev:web` |
| Web Docker + API local + DB Docker  | `corepack pnpm dev:docker:web`, then `corepack pnpm dev:api` |
| Web Docker + API Docker + DB Docker | `corepack pnpm dev:docker:all`                               |

Stop the DB Docker development stack with:

```powershell
corepack pnpm dev:docker:down
```

Network behavior:

- Browser opens `http://localhost:3000`.
- Web calls `http://localhost:8080/api`.
- API local connects to PostgreSQL at `localhost:5432`.
- API Docker connects to PostgreSQL at `db:5432`.

#### Native PostgreSQL scenarios

Use these when PostgreSQL is installed and running directly on the host machine.

First, create the database referenced by `DB_NAME` in `.env` and run the local preflight:

```powershell
corepack pnpm dev:infra:local
```

Then choose the app runtime combination:

| Scenario                           | Commands                                                              |
| ---------------------------------- | --------------------------------------------------------------------- |
| Web local + API local + DB local   | `corepack pnpm dev`                                                   |
| Web local + API Docker + DB local  | `corepack pnpm dev:docker:api:local-db`, then `corepack pnpm dev:web` |
| Web Docker + API local + DB local  | `corepack pnpm dev:docker:web:local-db`, then `corepack pnpm dev:api` |
| Web Docker + API Docker + DB local | `corepack pnpm dev:docker:all:local-db`                               |

Stop the local-DB Docker app stack with:

```powershell
corepack pnpm dev:docker:local-db:down
```

Network behavior:

- Browser opens `http://localhost:3000`.
- Web calls `http://localhost:8080/api`.
- API local connects to PostgreSQL at `localhost:5432`.
- API Docker connects to PostgreSQL through `LOCAL_DB_HOST_FOR_DOCKER`, which defaults to `host.docker.internal`.

For native PostgreSQL scenarios using the existing app env files, `apps/api/.env` must include the active database credentials read by Spring:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=weunite
DB_USERNAME=postgres
DB_PASSWORD=your-native-postgres-password
```

When the API runs in Docker, Compose overrides only `DB_HOST` to `host.docker.internal`; the other database values still come from `apps/api/.env`.

#### Detailed examples

##### Web local + API Docker + DB Docker

Start API and database in Docker:

```powershell
corepack pnpm dev:docker:api
```

In another terminal, start the web app locally:

```powershell
corepack pnpm dev:web
```

Network behavior:

- Browser opens `http://localhost:3000`.
- Web calls `http://localhost:8080/api`.
- Host port `8080` forwards to the API container.
- API container talks to PostgreSQL at `db:5432`.

##### Web Docker + API Docker + DB Docker

Start everything in Docker:

```powershell
corepack pnpm dev:docker:all
```

Network behavior:

- Browser opens `http://localhost:3000`.
- Vite runs in Docker, but its port is published to the host.
- Web calls `http://localhost:8080/api`.
- API container talks to PostgreSQL at `db:5432`.

##### Web Docker + API Local + DB Docker

Start web and database in Docker:

```powershell
corepack pnpm dev:docker:web
```

In another terminal, start the API locally:

```powershell
corepack pnpm dev:api
```

Network behavior:

- Browser opens `http://localhost:3000`.
- Web container serves Vite through the published host port.
- Web calls the local API at `http://localhost:8080/api`.
- API local connects to PostgreSQL at `localhost:5432`.

##### Web Local + API Local + DB Docker

Start only the database in Docker:

```powershell
corepack pnpm dev:infra
```

Start both apps locally:

```powershell
corepack pnpm dev
```

Network behavior:

- Browser opens `http://localhost:3000`.
- Web local calls API local at `http://localhost:8080/api`.
- API local connects to PostgreSQL at `localhost:5432`.

## Core commands

- `corepack pnpm install`: install workspace dependencies.
- `corepack pnpm dev:infra`: start local Docker Postgres.
- `corepack pnpm dev:infra:local`: validate the native PostgreSQL local setup.
- `corepack pnpm dev:docker:api`: start PostgreSQL and API in Docker.
- `corepack pnpm dev:docker:web`: start PostgreSQL and web in Docker.
- `corepack pnpm dev:docker:all`: start PostgreSQL, API, and web in Docker.
- `corepack pnpm dev:docker:down`: stop the Docker development stack.
- `corepack pnpm dev:docker:api:local-db`: start API in Docker against native PostgreSQL.
- `corepack pnpm dev:docker:web:local-db`: start web in Docker for a native PostgreSQL workflow.
- `corepack pnpm dev:docker:all:local-db`: start web and API in Docker against native PostgreSQL.
- `corepack pnpm dev:docker:local-db:down`: stop the native-DB Docker app stack.
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

- The recommended local configuration source is the root `.env`, copied from [.env.example](.env.example).
- `apps/api/.env` and `apps/web/.env` are optional app-level overrides for local Maven or Vite runs.
- Docker Compose reads the root `.env`.
- Web uses `VITE_API_URL` as the API origin. In Docker-first development, keep it as `http://localhost:8080`; the shared HTTP client appends `/api`.
- Mobile uses `EXPO_PUBLIC_API_URL`.
- API uses the variables documented in [.env.example](.env.example).
- API database configuration falls back to `localhost:5432/weunite`, so a local API can talk to the Docker database without changing code.
- When the API runs in Docker and PostgreSQL runs natively on the host, Compose sets `DB_HOST` from `LOCAL_DB_HOST_FOR_DOCKER`, which defaults to `host.docker.internal`.
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
