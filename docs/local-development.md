# Local Development

## Prerequisites

- Node.js 22 LTS
- pnpm 10
- Java 17
- Docker Desktop or compatible Docker runtime

## Install

```bash
pnpm install
```

## Environment files

- Web: `apps/web/.env.example`
- API: `apps/api/.env.example`
- Mobile: `apps/mobile/.env.example`

## Local workflow

1. Start infrastructure:

```bash
pnpm dev:infra
```

2. Start web and api together:

```bash
pnpm dev
```

3. Start mobile separately when needed:

```bash
pnpm dev:mobile
```

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
