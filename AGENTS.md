# AGENTS Guide

This repository uses `AGENTS.md` files as local operating notes for humans and coding agents.

## How to use this repo

- Start at this file for project-wide context.
- When working inside an app, package, or owned feature area, read the nearest `AGENTS.md` too.
- Treat the closest `AGENTS.md` as the source of truth for that scope.
- Keep changes scoped. If a task only touches one app or package, avoid unrelated edits elsewhere.

## Project shape

- `apps/web`: Vite + React web app.
- `apps/api`: Spring Boot API, auth, reporting, moderation, chat, and domain logic.
- `apps/mobile`: Expo mobile shell that will grow into the mobile client.
- `docs`: stable repo-level runbooks and architecture notes.
- `packages/contracts`: shared TypeScript contracts for web and mobile.
- `packages/eslint-config`: shared flat ESLint configs.
- `packages/typescript-config`: shared TypeScript configs.
- `infra`: local development infrastructure files.
- `tmp`: local-only planning and runtime area. Keep it ignored by Git.

## Repository rules

- The API is the single backend for business logic, persistence, auth, moderation, and websocket flows.
- Web and mobile must consume the API; do not move domain logic into frontend-only layers.
- Shared web/mobile request and response contracts belong in `packages/contracts`.
- Shared JS and TS tooling belongs in `packages/eslint-config` and `packages/typescript-config`.
- Stable docs belong in `docs`, not in app roots.
- Temporary plans, session notes, and runtime logs belong in `tmp`, not in tracked docs.
- When a directory has non-obvious boundaries or ownership, add a local `AGENTS.md`.

## Standard commands

- Install: `pnpm install`
- Local infrastructure: `pnpm dev:infra`
- Web + api dev: `pnpm dev`
- Web only: `pnpm dev:web`
- API only: `pnpm dev:api`
- Mobile only: `pnpm dev:mobile`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- Build: `pnpm build`
- Full validation: `pnpm check`

## How to maintain these AGENTS files

- Update the nearest `AGENTS.md` in the same change when you change that area's responsibilities, boundaries, entrypoints, or invariants.
- If you add a new app or package, add a sibling `AGENTS.md` once the directory has real ownership or non-obvious rules.
- Keep AGENTS docs short, factual, and implementation-oriented.
- Do not use AGENTS as changelogs. Summarize stable architecture and maintenance guidance only.
- If a local `AGENTS.md` contradicts this file, fix both in the same change.

## Where AGENTS.md should exist

- Keep one root `AGENTS.md` for repo-wide rules.
- Keep one `AGENTS.md` at each app or package root.
- Add deeper `AGENTS.md` files only for feature areas with real ownership, boundaries, or maintenance rules.
- Do not add `AGENTS.md` files to technical implementation folders that are obvious or incidental, such as `controller`, `dto`, `mapper`, `repository`, or empty placeholder directories.

## Minimum contents for any new local AGENTS.md

- What this area owns.
- What it should not own.
- Key entrypoints or files.
- Commands or validation relevant to this scope.
- A short "keep this file updated when..." note.
