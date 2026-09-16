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

- `lib/app/bootstrap.dart`: assembles config, storage, `SessionEvents`, `ApiClient`, and every repository into `AppDependencies`.
- `lib/app/app.dart`: root `WeUniteMobileApp` widget and provider tree.
- `lib/main.dart`: only `runApp(WeUniteMobileApp(dependencies: bootstrap()))`.
- `lib/core`: configuration, Dio client, JWT storage/interceptors, theme tokens, shared widgets.
- `lib/core/session`: session-wide events (e.g. `SessionEvents.onExpired`) shared between `ApiClient` and `AuthCubit`.
- `lib/features/*/data`: REST datasources, DTOs, repository implementations.
- `lib/features/*/domain`: entities, repository contracts, use cases.
- `lib/features/*/presentation`: cubits, screens, and widgets.

The API base URL defaults to `http://localhost:8080/api` and can be overridden with `WEUNITE_API_URL`.

## Session expiration

The API does not expose a refresh endpoint; a login response only returns `jwt` and `expiresIn`. When any authenticated request gets a 401, `ApiClient` clears the stored token and emits `SessionEvents.onExpired` (a 401 from `/auth/login` is treated as a bad credential, not an expired session, and does not emit). `AuthCubit` listens for that event and returns to `unauthenticated` with a "session expired" message, sending the user back to `LoginScreen`.

## Session-scoped state and navigation

Only `AuthCubit` lives above `MaterialApp`. The feature cubits (`FeedCubit`, `OpportunitiesCubit`, `ChatCubit`, `ProfileCubit`) are created inside the `authenticated` branch of `lib/app/app.dart`, under a `MultiBlocProvider` keyed with `ValueKey(user.id)`. Logging out and back in as a different user rebuilds that whole subtree, so no data from the previous session leaks into the next one.

`AppShell` renders its four tabs with an `IndexedStack`, so switching tabs does not rebuild the screens: scroll position and already-loaded data are preserved. Each screen only triggers its initial load when its cubit state has not been loaded yet (`hasLoaded == false`); pull-to-refresh always forces a new request. Feature states separate `loadErrorMessage` (blocks the whole screen only when there is no data yet) from `actionErrorMessage` (shown as a transient `SnackBar`, e.g. a failed like, comment, post, or a refresh that failed while data was already on screen).

## Current user id

Screens and cubits never read `AuthCubit.state.user?.id` to act on behalf of the signed-in user. `lib/core/session/current_user_provider.dart` defines `CurrentUserProvider` (`currentUserId`, `requireUserId()`), implemented by `AuthCurrentUserProvider` on top of `AuthRepository.currentUser`. `FeedRepositoryImpl`, `ChatRepositoryImpl`, and `ProfileRepositoryImpl` receive it and resolve the logged-in user's id internally, so their domain contracts (`FeedRepository.toggleLike`, `createPost`, `createComment`; `ChatRepository.getConversations`; `ProfileRepository.getMyProfile`, `toggleFollow`) no longer take a `userId` parameter. `ProfileRepository.getProfile(int userId)` still takes an explicit id because it is used to look up a third party's profile.
