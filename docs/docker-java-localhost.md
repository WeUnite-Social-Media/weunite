# Java API Local and Docker Runtime Guide

This guide explains how to run a Java API in two useful development modes:

- Locally on the host machine, where the app connects to services through `localhost`.
- Inside Docker, where the app connects to other containers by service name, while your browser and tools still reach it through `localhost`.

The WeUnite API uses Spring Boot, Java 17, PostgreSQL, and Docker Compose. The same ideas apply to other Java projects.

## The Mental Model

`localhost` means "this machine" from the point of view of the process using it.

- A Spring Boot app running directly on your laptop sees `localhost` as your laptop.
- A Spring Boot app running inside a container sees `localhost` as that container.
- A browser or Postman running on your laptop sees `localhost` as your laptop.

That is why a containerized app should not use `localhost` to reach a database container. In Docker Compose, it should use the database service name, such as `db`.

The browser can still call `http://localhost:8080` because Compose publishes the container port to the host with `8080:8080`.

## Runtime Modes

### Local App, Local or Docker Database

Use this when you want the API process to run from your IDE or Maven:

```bash
pnpm dev:infra
pnpm dev:api
```

In this mode, the API runs on the host and `DB_HOST=localhost` is correct because the PostgreSQL container publishes `5432:5432` to the host.

### Docker App, Docker Database

Use this when you want the API and database to run together in containers:

```bash
pnpm dev:api:docker
```

In this mode, the API container uses `DB_HOST=db` because `db` is the Compose service name. Your browser and Postman still use `http://localhost:8080` because the API service publishes `8080:8080`.

Stop the stack with:

```bash
pnpm dev:api:docker:down
```

## Dockerfile

The API Dockerfile is a multi-stage build:

```Dockerfile
FROM maven:3.9.5-eclipse-temurin-17 AS builder

WORKDIR /workspace

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

RUN groupadd --system spring && useradd --system --gid spring spring

COPY --from=builder /workspace/target/*.jar app.jar

USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

Why each part exists:

- The Maven builder image compiles the application.
- The runtime image uses the smaller JRE instead of a full JDK.
- `COPY pom.xml` before `COPY src` lets Docker cache dependencies when source files change.
- `EXPOSE 8080` documents the app port inside the container.
- The non-root `spring` user avoids running the app as root in the container.
- The app still needs `ports` in Compose or `docker run -p` before the host can reach it.

The `.dockerignore` file keeps local build output, env files, uploads, and editor files out of the image build context.

## Docker Compose

The full containerized API stack lives in `infra/docker/compose.api.yml`:

```yaml
services:
  db:
    image: postgres:15
    container_name: weunite-api-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: weunite
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - weunite_api_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d weunite"]
      interval: 5s
      timeout: 5s
      retries: 10

  api:
    image: weunite-api:local
    build:
      context: ../../apps/api
      dockerfile: Dockerfile
    depends_on:
      db:
        condition: service_healthy
    env_file:
      - ../../apps/api/.env
    environment:
      SERVER_PORT: 8080
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: weunite
      DB_USERNAME: postgres
      DB_PASSWORD: postgres
      CORS_ALLOWED_ORIGINS: http://localhost:3000,http://localhost:5173
    ports:
      - "8080:8080"

volumes:
  weunite_api_postgres_data:
```

Key details:

- `ports: "8080:8080"` maps host port `8080` to container port `8080`.
- `ports: "5432:5432"` lets host tools connect to PostgreSQL through `localhost:5432`.
- `DB_HOST=db` is correct inside Compose because service names resolve through Docker DNS.
- `env_file` loads secrets and local placeholders from `apps/api/.env`.
- `environment` overrides values that must change inside Docker, especially `DB_HOST`.
- The database health check prevents the API from starting before PostgreSQL accepts connections.
- The named volume preserves PostgreSQL data when containers are recreated.

## Spring Boot Configuration

The API keeps runtime configuration in `application.properties` and environment variables:

```properties
spring.application.name=weunite-api
server.port=${SERVER_PORT:8080}
spring.datasource.url=jdbc:postgresql://${env.DB_HOST:localhost}:${env.DB_PORT:5432}/${env.DB_NAME:weunite}
spring.datasource.username=${env.DB_USERNAME}
spring.datasource.password=${env.DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}
```

Why this works:

- The code never hardcodes the database host, credentials, or allowed frontend origins.
- The local `.env` can use `DB_HOST=localhost`.
- Compose can override `DB_HOST=db` for the container.
- `SERVER_PORT` defaults to `8080`, but another environment can change it without code edits.

The same shape in `application.yml` would look like this:

```yaml
spring:
  application:
    name: weunite-api
  datasource:
    url: jdbc:postgresql://${env.DB_HOST:localhost}:${env.DB_PORT:5432}/${env.DB_NAME:weunite}
    username: ${env.DB_USERNAME}
    password: ${env.DB_PASSWORD}
    driver-class-name: org.postgresql.Driver

server:
  port: ${SERVER_PORT:8080}

app:
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}
```

Use either properties or YAML in a project, not both for the same keys.

## Environment Variables

For local development, copy the env example:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Alternative on macOS/Linux:

```bash
cp apps/api/.env.example apps/api/.env
```

For local API execution, keep:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=weunite
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

For Docker API execution, Compose overrides the database values:

```env
DB_HOST=db
DB_PORT=5432
DB_NAME=weunite
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

The app code reads the same variables in both cases. Only the environment changes.

## Commands

Build the API jar locally:

```bash
pnpm --filter @weunite/api build
```

Run the API locally with the database container:

```bash
pnpm dev:infra
pnpm dev:api
```

Build the Docker image directly:

```bash
docker build -t weunite-api:local apps/api
```

Run the image directly against a host database:

```bash
docker run --rm -p 8080:8080 --env-file apps/api/.env -e DB_HOST=host.docker.internal weunite-api:local
```

Run the API and database with Docker Compose:

```bash
pnpm dev:api:docker
```

Stop the Docker API stack:

```bash
pnpm dev:api:docker:down
```

## Testing Localhost

After the API starts, test the health endpoint:

```bash
curl http://localhost:8080/actuator/health
```

Expected result:

```json
{ "status": "UP" }
```

You can also open the same URL in a browser or send a GET request from Postman.

If the API is running in Docker, this still works because `8080:8080` maps the container's port to the host.

## Common Errors

### Database Connection Refused

Typical message:

```text
Connection to localhost:5432 refused
```

Cause:

- The database is not running, or the app is inside Docker and incorrectly using `localhost`.

Fix:

- For a local app, start PostgreSQL and use `DB_HOST=localhost`.
- For a Compose app, use `DB_HOST=db`.
- Run `docker compose -f infra/docker/compose.api.yml ps` to check container status.

### Unknown Host `db`

Typical message:

```text
UnknownHostException: db
```

Cause:

- The app is running locally on the host, not inside the Compose network.

Fix:

- Use `DB_HOST=localhost` when the API is running outside Docker.
- Use `DB_HOST=db` only when the API is running inside the same Compose project as the `db` service.

### Port 8080 Is Already Occupied

Typical message:

```text
Bind for 0.0.0.0:8080 failed: port is already allocated
```

Cause:

- Another API process or container already uses host port `8080`.

Fix:

- Stop the other process, or change the host side of the mapping, for example `8081:8080`.
- If you change the host port to `8081`, browse to `http://localhost:8081`.

### Port 5432 Is Already Occupied

Cause:

- A native PostgreSQL instance or another container already uses host port `5432`.

Fix:

- Stop the other PostgreSQL process, or change the host mapping to `5433:5432`.
- Keep `DB_PORT=5432` for containers talking to each other inside Compose, because the database container still listens on `5432`.

### Env File Missing

Typical message:

```text
env file ... apps/api/.env not found
```

Fix:

- Copy `apps/api/.env.example` to `apps/api/.env`.
- Fill in required values such as JWT keys, mail placeholders, Cloudinary URL, and database credentials.

### API Starts but Browser Cannot Reach It

Cause:

- The container port is not published to the host, or the host port changed.

Fix:

- Ensure Compose has `ports: ["8080:8080"]`.
- Use `http://localhost:8080` from the host.
- If the mapping is `8081:8080`, use `http://localhost:8081`.

## Adapt This Pattern

For another Java project, keep the same structure:

- Put runtime values in environment variables.
- Keep local defaults in `application.properties` or `application.yml`.
- Use `localhost` only for host-side processes.
- Use Compose service names for container-to-container calls.
- Publish ports only for services you need to reach from your browser, IDE, or Postman.
- Keep secrets out of Docker images with `.dockerignore` and `env_file`.
