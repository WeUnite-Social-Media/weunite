# Mobile Agent Notes

## Scope

This package owns the Flutter mobile client in `apps/mobile`.

## Responsibilities

- Render the mobile application for auth, feed, opportunities, chat, and profile flows.
- Consume the Spring API through explicit REST clients under `lib/core/network`.
- Keep feature code organized with Clean Architecture boundaries: `data`, `domain`, and `presentation`.
- Mirror mobile-facing design patterns from `apps/web`, especially header/bottom navigation, cards, badges, forms, and color tokens.

## Does not own

- Backend business rules.
- Web-specific rendering logic.
- Shared JavaScript or TypeScript tooling packages.

## Key entrypoints

- `lib/main.dart`: Flutter bootstrap, dependency graph, and root app.
- `lib/core`: configuration, Dio client, token storage, theme, widgets, and error handling.
- `lib/features/*`: feature-owned data, domain, and presentation code.
- `pubspec.yaml`: Flutter dependencies and assets.

## Working rules

- Keep the app frontend-only; backend domain behavior must stay in `apps/api`.
- Read API contracts from `apps/api` and mirror existing web client requests before adding mobile endpoints.
- Configure API hosts with `--dart-define=WEUNITE_API_URL=...`; do not assume Vite proxy behavior.
- Keep secure session state in `flutter_secure_storage`, not plain preferences.
- Collection reads for posts, opportunities, conversations, and messages return top-level JSON arrays; profile reads use `ResponseDTO.data`.
- Debug HTTP diagnostics live in `core/network/api_diagnostics.dart`. Log metadata and error types only, never credentials, headers, query values, or message bodies.
- Update this file when navigation, auth/session bootstrap, or runtime configuration rules change.

## Validation

- `pnpm --filter @weunite/mobile lint`
- `pnpm --filter @weunite/mobile typecheck`
- `pnpm --filter @weunite/mobile build`
