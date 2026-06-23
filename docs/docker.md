# Docker Development Guide

This guide covers local development combinations for the WeUnite web app, API, and PostgreSQL database.

Run every command from the repository root. Use `corepack pnpm ...` if your shell does not already resolve the pinned pnpm version.

## Compose Files

- `infra/docker/compose.dev.yml`: default Docker development stack. It can run PostgreSQL, API, web, or combinations of them.
- `infra/docker/compose.local-db.yml`: Dockerized app services that connect to PostgreSQL running natively on the host.

## Service URLs

- Web: `http://localhost:3000`
- API: `http://localhost:8080/api`
- WebSocket: `http://localhost:8080/ws`
- PostgreSQL: `localhost:5432`

Inside Docker, the API connects to the Docker database through `db:5432`. When the API runs in Docker against native PostgreSQL, it connects through `LOCAL_DB_HOST_FOR_DOCKER`, which defaults to `host.docker.internal`.

## Single Services

| What to run          | Command                          |
| -------------------- | -------------------------------- |
| Local web only       | `corepack pnpm dev:local:web`    |
| Local API only       | `corepack pnpm dev:local:api`    |
| Local mobile only    | `corepack pnpm dev:local:mobile` |
| Docker database only | `corepack pnpm dev:docker:db`    |
| Docker API only      | `corepack pnpm dev:docker:api`   |
| Docker web only      | `corepack pnpm dev:docker:web`   |

`dev:docker:api` starts only the API container and connects to PostgreSQL running on the host through `LOCAL_DB_HOST_FOR_DOCKER`, which defaults to `host.docker.internal`.

`dev:docker:web` starts only the web container. The React code runs in the browser and calls the API origin configured by `VITE_API_URL`.

## All Local

Use this when web and API run on the host.

| Scenario              | Command                   |
| --------------------- | ------------------------- |
| Web local + API local | `corepack pnpm dev`       |
| Web local + API local | `corepack pnpm dev:local` |

If PostgreSQL is native, validate it first:

```powershell
corepack pnpm dev:local:check-db
corepack pnpm dev
```

If PostgreSQL should run in Docker while web and API run locally:

```powershell
corepack pnpm dev:docker:db
corepack pnpm dev
```

## All Docker

Use this when web, API, and PostgreSQL should all run in Docker.

| Scenario                            | Command                               |
| ----------------------------------- | ------------------------------------- |
| Web Docker + API Docker + DB Docker | `corepack pnpm dev:docker`            |
| Web Docker + API Docker + DB Docker | `corepack pnpm dev:docker:web-api-db` |

Stop the default Docker stack with:

```powershell
corepack pnpm dev:docker:down
```

## Docker Database Combinations

Use these when PostgreSQL runs in Docker.

| Scenario                            | Command                                                               |
| ----------------------------------- | --------------------------------------------------------------------- |
| DB Docker only                      | `corepack pnpm dev:docker:db`                                         |
| API Docker + DB Docker              | `corepack pnpm dev:docker:api-db`                                     |
| Web Docker + DB Docker              | `corepack pnpm dev:docker:web-db`                                     |
| Web Docker + API Docker + DB Docker | `corepack pnpm dev:docker`                                            |
| Web local + API local + DB Docker   | `corepack pnpm dev:docker:db`, then `corepack pnpm dev`               |
| Web local + API Docker + DB Docker  | `corepack pnpm dev:docker:api-db`, then `corepack pnpm dev:local:web` |
| Web Docker + API local + DB Docker  | `corepack pnpm dev:docker:web-db`, then `corepack pnpm dev:local:api` |

The rows with two commands need two terminals because each app process stays attached while it runs.

## Native Database Combinations

Use these when PostgreSQL is installed and running on the host.

First validate the native database:

```powershell
corepack pnpm dev:local:check-db
```

Then choose a runtime:

| Scenario                           | Command                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| Web local + API local + DB local   | `corepack pnpm dev`                                                          |
| Web local + API Docker + DB local  | `corepack pnpm dev:docker:api-local-db`, then `corepack pnpm dev:local:web`  |
| Web Docker + API local + DB local  | `corepack pnpm dev:docker:web-local-api`, then `corepack pnpm dev:local:api` |
| Web Docker + API Docker + DB local | `corepack pnpm dev:docker:web-api`                                           |

Stop the native-DB Docker app stack with:

```powershell
corepack pnpm dev:docker:local-db:down
```

## Environment

The root `.env` is the recommended configuration source for Docker. All `dev:docker:*` scripts pass it to Compose with `--env-file .env`, so the same file is used for `${...}` interpolation and for container environment values.

Start from:

```powershell
Copy-Item .env.example .env
```

Review these values:

- `VITE_API_URL=http://localhost:8080`
- `VITE_WS_URL=http://localhost:8080/ws`
- `VITE_MEDIA_URL=http://localhost:8080`
- `WEB_HOST_PORT=3000`
- `API_HOST_PORT=8080`
- `DB_DOCKER_NAME=weunite`
- `DB_DOCKER_USERNAME=postgres`
- `DB_DOCKER_PASSWORD=postgres`
- `DB_LOCAL_PASSWORD=<your-native-postgres-password>`
- `LOCAL_DB_HOST_FOR_DOCKER=host.docker.internal`
- `JWT_PUBLIC_KEY=<base64-encoded-public-pem>`
- `JWT_PRIVATE_KEY=<base64-encoded-private-pem>`

For local development, generate valid RSA JWT keys with:

```powershell
corepack pnpm dev:local:jwt-keys
```

For native PostgreSQL scenarios, the root `.env` should include the active database credentials read by Spring:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=weunite
DB_USERNAME=postgres
DB_PASSWORD=your-native-postgres-password
```

When the API runs in Docker against native PostgreSQL, Compose overrides `DB_HOST` to `host.docker.internal` by default.

## Troubleshooting

- If the API cannot reach PostgreSQL in Docker, confirm the database is healthy with `docker compose -f infra/docker/compose.dev.yml ps`.
- If the browser cannot reach the API, confirm `VITE_API_URL` points to `http://localhost:8080`.
- If ports are already in use, change `WEB_HOST_PORT`, `API_HOST_PORT`, or `DB_HOST_PORT` in `.env`.
- If Dockerized web installs dependencies slowly on first boot, let the container finish; node modules and the pnpm store are persisted in Docker volumes.
