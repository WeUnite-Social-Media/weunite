# API Agent Notes

## Scope

This package owns the Spring Boot backend in `apps/api`.

## Responsibilities

- Expose the platform API under `/api/...`.
- Hold auth, users, posts, opportunities, chat, notifications, reporting, moderation, and shared backend infrastructure.
- Own database access, transactional business logic, websocket support, and email/image integrations.

## Does not own

- Web or mobile rendering.
- Client-only state.
- Shared TypeScript config or frontend contracts implementation details.

## Key entrypoints

- `src/main/java/com/weunite/api/WeuniteAuthApplication.java`: Spring Boot bootstrap.
- `src/main/java/com/weunite/api/common/*`: shared backend infrastructure.
- `src/main/java/com/weunite/api/*`: feature modules.
- `src/main/resources/db/migration/*`: versioned database migrations.
- `src/main/resources/application.properties`: runtime configuration.
- `pom.xml`: Java build and plugin setup.

## Working rules

- Keep controllers thin and push domain logic into services.
- Keep feature-specific types, repositories, and mappers inside their feature module.
- Keep cross-cutting config, error handling, validation, mail, storage, and security under `common`.
- Keep runtime configuration environment-driven; local PostgreSQL support should flow through app properties and env defaults instead of hardcoded machine-specific values.
- Keep production/runtime schema ownership in Flyway migrations; Hibernate should validate mapped schema rather than mutate it at startup.
- Keep backend source comments and admin-facing response text ASCII-safe or valid UTF-8; do not commit mojibake.
- Prefer repository-backed calculations for dashboard and moderation summaries when historical accuracy matters instead of heuristic constants.
- Preserve existing HTTP contracts unless a product/API change is explicit.
- Do not recreate root-level package-by-layer buckets such as `controller`, `dto`, `mapper`, `repository`, `service`, or `exceptions`.
- Add deeper `AGENTS.md` files only for backend feature modules with real ownership or non-obvious maintenance rules.

## Validation

- `pnpm --filter @weunite/api lint`
- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Module boundaries change.
- Shared backend infrastructure changes.
- Runtime configuration or integration ownership changes.
