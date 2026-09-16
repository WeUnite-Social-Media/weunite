# WeUnite Mobile

Flutter mobile client for WeUnite.

## Run

```sh
flutter pub get
flutter run --dart-define=WEUNITE_API_URL=http://localhost:8080/api
```

The monorepo adapter scripts also work once Flutter is installed:

```sh
pnpm --filter @weunite/mobile lint
pnpm --filter @weunite/mobile typecheck
pnpm --filter @weunite/mobile build
```

## Architecture

- `lib/core`: configuration, Dio client, JWT storage/interceptors, theme tokens, shared widgets.
- `lib/core/session`: session-wide events (e.g. `SessionEvents.onExpired`) shared between `ApiClient` and `AuthCubit`.
- `lib/features/*/data`: REST datasources, DTOs, repository implementations.
- `lib/features/*/domain`: entities, repository contracts, use cases.
- `lib/features/*/presentation`: cubits, screens, and widgets.

The API base URL defaults to `http://localhost:8080/api` and can be overridden with `WEUNITE_API_URL`.

## Session expiration

The API does not expose a refresh endpoint; a login response only returns `jwt` and `expiresIn`. When any authenticated request gets a 401, `ApiClient` clears the stored token and emits `SessionEvents.onExpired` (a 401 from `/auth/login` is treated as a bad credential, not an expired session, and does not emit). `AuthCubit` listens for that event and returns to `unauthenticated` with a "session expired" message, sending the user back to `LoginScreen`.
