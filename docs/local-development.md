# Local Development

This page covers the host-local workflow. For Docker combinations, see [Docker Development Guide](docker.md).

## Prerequisites

- Node.js 22 LTS
- pnpm 10 through Corepack
- Java 17
- PostgreSQL 15+ locally, or PostgreSQL in Docker

## Install

Run from the repository root:

```bash
pnpm install
```

If you are inside `apps/api` or `apps/web`, go back first:

- Windows PowerShell: `cd ..\..`
- macOS/Linux: `cd ../..`

## Environment

The root `.env` is the recommended local configuration source:

```powershell
Copy-Item .env.example .env
```

Alternative on macOS/Linux:

```bash
cp .env.example .env
```

App-level `.env` files under `apps/api` and `apps/web` can be used as overrides for local app runs.

## Native PostgreSQL

1. Install and start PostgreSQL locally.

2. Create the local database:

```bash
createdb weunite
```

Alternative with `psql`:

```bash
psql -U postgres -c "CREATE DATABASE weunite;"
```

3. Validate the local database configuration:

```bash
pnpm dev:local:check-db
```

4. Start web and API locally:

```bash
pnpm dev
```

## Docker PostgreSQL With Local Apps

Start only PostgreSQL in Docker:

```bash
pnpm dev:docker:db
```

Then start web and API locally:

```bash
pnpm dev
```

## Local Commands

- `pnpm dev`: start web and API locally.
- `pnpm dev:local`: start web and API locally.
- `pnpm dev:local:web`: start only the web app locally.
- `pnpm dev:local:api`: start only the API locally.
- `pnpm dev:local:mobile`: start the mobile shell.
- `pnpm dev:local:check-db`: validate native PostgreSQL setup.

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
