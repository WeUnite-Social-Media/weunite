# Java API Local and Docker Runtime Guide

This note explains the networking rule that matters most when running the WeUnite API locally or in Docker. For the complete command matrix, see [Docker Development Guide](docker.md).

## Mental Model

`localhost` means "this machine" from the point of view of the process using it.

- A Spring Boot app running directly on your laptop sees `localhost` as your laptop.
- A Spring Boot app running inside a container sees `localhost` as that container.
- A browser, curl, or Postman running on your laptop sees `localhost` as your laptop.

That is why a containerized API should not use `localhost` to reach a database container. In Docker Compose, it should use the database service name, `db`.

The browser can still call a containerized API through `localhost` because Compose publishes the container port to a host port.

## Common Modes

### Local API, Docker Database

```bash
pnpm dev:docker:db
pnpm dev:local:api
```

The API runs on the host and connects to PostgreSQL through `localhost:5432`.

### Docker API, Docker Database

```bash
pnpm dev:docker:api-db
```

The API container connects to PostgreSQL through `db:5432`. Host tools reach the API through `http://localhost:8080`.

### Docker API, Native Database

```bash
pnpm dev:local:check-db
pnpm dev:docker:api-local-db
```

The API container connects to the host database through `LOCAL_DB_HOST_FOR_DOCKER`, which defaults to `host.docker.internal`.

## Spring Boot Configuration

The API keeps runtime configuration in environment variables:

```properties
server.port=${SERVER_PORT:8080}
spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:weunite}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}
```

This lets the same code run in both places:

- Local API: `DB_HOST=localhost`
- Docker API with Docker database: `DB_HOST=db`
- Docker API with native database: `DB_HOST=host.docker.internal`

## Troubleshooting

### Database Connection Refused

For a local API, confirm PostgreSQL is reachable at `localhost:5432`. For a Docker API with Docker PostgreSQL, confirm the API uses `DB_HOST=db`.

### Unknown Host `db`

The API is probably running locally on the host. Use `DB_HOST=localhost` outside Docker.

### Port Already Occupied

Change the host-side port in `.env`, for example `API_HOST_PORT`, `WEB_HOST_PORT`, or `DB_HOST_PORT`.

### Docker Status

Check running services with:

```bash
docker compose -f infra/docker/compose.dev.yml ps
```

Stop the default Docker stack with:

```bash
pnpm dev:docker:down
```
