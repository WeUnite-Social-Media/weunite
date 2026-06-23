# WeUnite Monorepo

WeUnite is a social platform for athletes, companies, opportunities, and community interaction. This repository contains the web app, Spring Boot API, mobile shell, shared contracts, tooling packages, docs, and local infrastructure.

## Project Shape

- `apps/web`: Vite + React web client.
- `apps/api`: Spring Boot API for auth, domain logic, persistence, moderation, reporting, chat, and WebSocket flows.
- `apps/mobile`: Expo mobile shell.
- `packages/contracts`: shared TypeScript contracts for web and mobile.
- `packages/eslint-config`: shared ESLint flat configs.
- `packages/typescript-config`: shared TypeScript configs.
- `docs`: stable architecture notes and runbooks.
- `infra`: Docker and local development infrastructure.
- `tmp`: ignored local notes and runtime files.

## Prerequisites

- Node.js 22 with Corepack enabled.
- pnpm 10.x through the pinned version in `package.json`.
- Java 17+.
- Docker Desktop with Docker Compose.
- PostgreSQL 15+ only when using a native database instead of Docker.

## Quick Start

Run commands from the repository root.

```powershell
corepack enable
corepack pnpm install
Copy-Item .env.example .env
```

Fill in `.env`, then choose a runtime:

```powershell
corepack pnpm dev
```

This starts the web and API locally. Use Docker for PostgreSQL when you do not have a native database running:

```powershell
corepack pnpm dev:docker:db
corepack pnpm dev
```

Main local URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:8080/api`
- PostgreSQL: `localhost:5432`

## Main Commands

- `corepack pnpm dev`: start web and API locally.
- `corepack pnpm dev:local`: start web and API locally.
- `corepack pnpm dev:local:web`: start only the web app locally.
- `corepack pnpm dev:local:api`: start only the API locally.
- `corepack pnpm dev:local:mobile`: start the mobile shell.
- `corepack pnpm dev:local:check-db`: validate native PostgreSQL setup.
- `corepack pnpm dev:local:jwt-keys`: generate local RSA JWT keys into `.env`.
- `corepack pnpm dev:docker`: start web, API, and PostgreSQL in Docker.
- `corepack pnpm dev:docker:db`: start only PostgreSQL in Docker.
- `corepack pnpm dev:docker:down`: stop the default Docker development stack.
- `corepack pnpm lint`: run lint checks.
- `corepack pnpm typecheck`: run type checks.
- `corepack pnpm test`: run tests.
- `corepack pnpm build`: build the workspace.
- `corepack pnpm check`: run lint, typecheck, test, and build.

For every Docker combination, environment details, and troubleshooting notes, see [Docker Development Guide](docs/docker.md).

## Environment

The recommended local configuration source is the root `.env`, copied from [.env.example](.env.example). Docker Compose reads this root file. App-level `.env` files under `apps/api` and `apps/web` can be used for local app overrides.

Important defaults:

- `VITE_API_URL=http://localhost:8080`
- `VITE_WS_URL=http://localhost:8080/ws`
- `VITE_MEDIA_URL=http://localhost:8080`
- `WEB_HOST_PORT=3000`
- `API_HOST_PORT=8080`
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=weunite`

## Documentation

- [Docker Development Guide](docs/docker.md)
- [Local Development Notes](docs/local-development.md)
- [Java API Local and Docker Runtime Guide](docs/docker-java-localhost.md)
- [Architecture Notes](docs/architecture/)
- [Domain Notes](docs/domains/)

Start with [AGENTS.md](AGENTS.md) for repository-wide operating notes.
