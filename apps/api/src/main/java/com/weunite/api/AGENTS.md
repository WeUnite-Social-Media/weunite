## Scope

This folder owns the backend Java package root in `com.weunite.api`.

## Responsibilities

- Route backend work into the correct feature module under this package.
- Keep feature modules separated from cross-cutting infrastructure in `common`.
- Hold the Spring Boot entrypoint and the module layout for the API source tree.

## Does not own

- Web or mobile rendering.
- Frontend-only state and UI contracts.
- Resources outside the Java package tree.

## Key entrypoints

- `WeuniteAuthApplication.java`
- `common/`
- `admin/`
- `auth/`
- `chat/`
- `follow/`
- `notifications/`
- `opportunities/`
- `posts/`
- `reports/`
- `users/`

## Working rules

- Add new backend feature modules as siblings here instead of creating root package-by-layer buckets.
- Keep cross-cutting config, security, validation, exception handling, mail, and storage concerns in `common`.
- Keep feature-specific controllers, services, DTOs, mappers, repositories, and domain entities inside their module.
- Add or update a child `AGENTS.md` when a module gains non-obvious ownership or maintenance rules.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- A backend feature module is added, removed, or renamed.
- Ownership moves between `common` and a feature module.
- The package-root entrypoints change.
