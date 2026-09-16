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

- `lib/main.dart`: only calls `runApp(WeUniteMobileApp(dependencies: bootstrap()))`.
- `lib/app/bootstrap.dart`: builds `AppConfig`, `TokenStorage`, `SessionEvents`, `ApiClient`, and every repository into an `AppDependencies` bundle.
- `lib/app/app.dart`: root `WeUniteMobileApp` widget — `MultiRepositoryProvider` + the session-wide `AuthCubit` at the top, `AuthCubit` state drives which branch renders.
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
- There is no `/auth/refresh` endpoint on the API today (only `jwt` + `expiresIn` are issued on login). `ApiClient` does not retry on 401: an authenticated request that gets 401 clears the stored token and notifies `core/session/session_events.dart` (`SessionEvents.onExpired`), except for `/auth/login`, whose 401 means a bad credential, not an expired session. `AuthCubit` listens to `onExpired` and moves to `unauthenticated` with a session-expired message. `TokenStorage` also persists the access token's expiry instant so `AuthRepositoryImpl.restoreSession` treats an expired or orphaned (token without cached user) token as no session.
- **Session-scoped cubits**: only `AuthCubit` lives above `MaterialApp`. `FeedCubit`, `OpportunitiesCubit`, `ChatCubit`, and `ProfileCubit` are created inside the `authenticated` branch of `lib/app/app.dart`, wrapped in a `MultiBlocProvider` keyed with `ValueKey(user.id)`. That key forces the whole subtree (cubits + `AppShell`) to be torn down and rebuilt whenever the logged-in user changes, so a new session never sees stale state from the previous user.
- **Tab navigation**: `AppShell` renders the four tabs with `IndexedStack` (not a rebuilt `switch`), so each tab screen is created once per session and keeps its scroll position and cubit state when the user switches tabs. Each screen's `initState` only triggers its initial load when `state.hasLoaded` is still `false`; pull-to-refresh always forces a reload by calling the cubit method directly.
- **Load vs action errors**: feature states expose `loadErrorMessage` (consumed by `AsyncStateView`, only set when there is no data to show) and `actionErrorMessage` (shown as a `SnackBar` via a `BlocListener`/`BlocConsumer` and cleared right after, via each cubit's `dismissActionError()`). A failed reload that happens while data is already present (e.g. pull-to-refresh, pagination, like/comment/post actions) always reports through `actionErrorMessage` so the existing list stays on screen instead of being replaced by the full-screen error view.
- **State `copyWith`**: error fields use a `ValueGetter<String?>?` parameter (`import 'package:flutter/foundation.dart'`) instead of a plain nullable value, so omitting the parameter really means "keep the previous value" and passing `() => null` really clears it. Follow this pattern for any new nullable state field that must be explicitly clearable.
- Bottom sheets opened from a screen whose cubit now lives inside the `authenticated` branch (e.g. `CommentsSheet`, `CreatePostSheet` from `FeedScreen`) must re-provide that cubit explicitly with `BlocProvider.value(value: context.read<FeedCubit>(), child: ...)` in the `showModalBottomSheet` builder — modal routes are siblings of the route that hosts the provider in the widget tree, not descendants, so ambient `context.read` lookups fail otherwise.
- **Current user id**: don't read `context.read<AuthCubit>().state.user?.id` in screens/widgets to act on behalf of the signed-in user or pass it into a cubit/repository call. `core/session/current_user_provider.dart` defines `CurrentUserProvider` (`currentUserId`, `requireUserId()`, which throws `AppException('Sessão inválida.')` when there is no session), implemented by `AuthCurrentUserProvider` on top of `AuthRepository.currentUser`. `bootstrap()` builds one instance and injects it into `FeedRepositoryImpl`, `ChatRepositoryImpl`, and `ProfileRepositoryImpl`, which resolve the id internally instead of taking a `userId` parameter (`FeedRepository.toggleLike/createPost/createComment`, `ChatRepository.getConversations`, `ProfileRepository.getMyProfile`/`toggleFollow`). `ProfileRepository.getProfile(int userId)` is the one exception that keeps an explicit id, because it looks up someone else's profile rather than the caller's own. Follow this pattern for any new repository method whose id is always the logged-in user.
- Update this file when navigation, auth/session bootstrap, or runtime configuration rules change.

## Validation

- `pnpm --filter @weunite/mobile lint`
- `pnpm --filter @weunite/mobile typecheck`
- `pnpm --filter @weunite/mobile build`
