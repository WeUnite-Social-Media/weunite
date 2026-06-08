# Local Development

## Prerequisites

- Node.js 22 LTS
- pnpm 10
- Java 17
- PostgreSQL 15+ local, or Docker Desktop / compatible Docker runtime

## Install

```bash
pnpm install
```

Run the workspace scripts from the repository root (`weunite/`).

If you are inside `apps/api` or `apps/web`, go back first:

- Windows PowerShell: `cd ..\..`
- macOS/Linux: `cd ../..`

## Environment files

- Web: `apps/web/.env.example`
- API: `apps/api/.env.example`
- Mobile: `apps/mobile/.env.example`

## Local workflow with native PostgreSQL

1. Install and start PostgreSQL locally.

2. Create the local database:

```bash
createdb weunite
```

Alternative with `psql`:

```bash
psql -U postgres -c "CREATE DATABASE weunite;"
```

3. Copy the example env files and fill them in:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

Alternative on macOS/Linux:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

4. Run the local preflight:

```bash
pnpm dev:infra:local
```

5. Start web and api together:

```bash
pnpm dev
```

6. Start mobile separately when needed:

```bash
pnpm dev:mobile
```

`pnpm dev:infra:local` validates:

- `apps/api/.env` and `apps/web/.env`
- required API env vars
- base64 RSA JWT keys
- TCP connectivity to PostgreSQL using `DB_HOST` / `DB_PORT`

## Local workflow with Docker

1. Start the bundled PostgreSQL container:

```bash
pnpm dev:infra
```

2. Start web and api:

```bash
pnpm dev
```

## Local workflow with Dockerized API

Run the API and PostgreSQL together in Docker:

```bash
pnpm dev:api:docker
```

The API is available from the host at `http://localhost:8081` because Docker Compose maps host port `8081` to container port `8080`. Inside the Compose network, the API connects to PostgreSQL with `DB_HOST=db` instead of `localhost`.

By default, this stack also publishes the Dockerized PostgreSQL service on host port `5433`. That keeps it from colliding with the local API on `8080` or the local development database on `5432`.

Stop the stack:

```bash
pnpm dev:api:docker:down
```

For the full explanation of local vs container networking, environment variables, and troubleshooting, see [Java API Local and Docker Runtime Guide](docker-java-localhost.md).

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

API-only checks:

```bash
pnpm --filter @weunite/api lint
pnpm --filter @weunite/api test
pnpm --filter @weunite/api build
```
