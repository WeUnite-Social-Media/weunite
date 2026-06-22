# Infra Agent Notes

## Scope

This folder owns local development infrastructure files under `infra/`.

## Responsibilities

- Hold Docker and local-environment infrastructure assets used by the workspace.
- Support local API and app development without owning product business logic.

## Does not own

- App runtime code.
- Stable team docs.
- Temporary machine-local logs or notes.

## Key entrypoints

- `docker/`

## Working rules

- Keep local infrastructure reproducible and environment-driven.
- Prefer shared repo commands over machine-specific manual setup steps.
- Coordinate infra changes with app configuration changes when ports, services, or env expectations shift.

## Validation

- `pnpm dev:local:check-db`
- `pnpm dev:docker`
- `pnpm dev:docker:db`
- `pnpm dev:docker:api`
- `pnpm dev:docker:web`
- `pnpm dev:docker:api-db`
- `pnpm dev:docker:web-db`
- `pnpm dev:docker:web-api`

## Keep this file updated when

- Local infrastructure entrypoints or supported workflows change.
- Ownership moves between infra files and app configuration.
