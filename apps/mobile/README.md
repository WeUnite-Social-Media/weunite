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
- `lib/features/*/data`: REST datasources, DTOs, repository implementations.
- `lib/features/*/domain`: entities, repository contracts, use cases.
- `lib/features/*/presentation`: cubits, screens, and widgets.

The API base URL defaults to `http://localhost:8080/api` and can be overridden with `WEUNITE_API_URL`.
