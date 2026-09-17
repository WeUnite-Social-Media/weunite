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

Screens and cubits never read `AuthCubit.state.user?.id` to act on behalf of the signed-in user. `lib/core/session/current_user_provider.dart` defines `CurrentUserProvider` (`currentUserId`, `requireUserId()`), implemented by `AuthCurrentUserProvider` on top of `AuthRepository.currentUser`. `FeedRepositoryImpl`, `ChatRepositoryImpl`, and `ProfileRepositoryImpl` receive it and resolve the logged-in user's id internally, so their domain contracts (`FeedRepository.toggleLike`, `createPost`, `createComment`; `ChatRepository.getConversations`, `getMessages`, `sendMessage`; `ProfileRepository.getMyProfile`, `toggleFollow`) no longer take a `userId` parameter. `ProfileRepository.getProfile(int userId)` still takes an explicit id because it is used to look up a third party's profile. The one exception is display-only: the message bubble in `ConversationScreen` reads `state.user?.id` purely to align its own messages to the right.

## Chat realtime

Tapping a conversation in `ConversationsScreen` navigates to `/chat/{id}` with `go_router`. Each conversation screen owns a `ConversationCubit` that loads history over REST (`GET /conversations/{id}/messages/{userId}`) and subscribes to `ChatRepository.watchConversation(id)` for live updates, merging by message `id` so the REST snapshot and the realtime echo of a just-sent message never duplicate.

`ChatRealtimeClient` keeps a single STOMP-over-SockJS connection per session, opened lazily on the first subscription. The API publishes every event for a conversation — new message, edit, delete — on `/topic/conversation/{id}`; a delete is a `{"type":"DELETE","messageId":...}` map rather than a `MessageDTO`, so `parseChatRealtimeEvent` checks that shape first. Sending a message posts to `/app/chat.sendMessage` with a `jsonEncode`d body, so quotes, backslashes, and newlines in the message content round-trip correctly. Because `stomp_dart_client` freezes its connect headers and reconnect delay for the lifetime of a `StompClient`, reconnection is handled by `ChatRealtimeClient` itself: `reconnectDelay: Duration.zero` on the underlying client, plus our own exponential backoff (1s to 30s) that builds a fresh `StompClient` and rereads the current token on every attempt. A successful reconnect emits `ChatRealtimeReconnected`, which makes `ConversationCubit` reload history over REST to catch anything missed while offline.

`ChatRepository.disconnectRealtime()` runs from a `BlocListener<AuthCubit, AuthState>` in `lib/app/app.dart` whenever the session leaves `authenticated` (logout or session expiration from above); the same listener pops the navigator back to its first route, since a pushed `ConversationScreen` would otherwise survive a swap of `MaterialApp.home`.

Known gaps: there is no realtime read-receipt (the API only broadcasts `/topic/conversation/{id}/read` in response to `/app/chat.markAsRead`, which nothing currently calls) and no mobile UI to mark a conversation as read.

## Navigation (go_router)

`lib/app/router.dart` builds the app's single `GoRouter`, used by `MaterialApp.router` in `lib/app/app.dart`. Route map:

| Route | Notes |
| --- | --- |
| `/splash` | Shown while `AuthCubit` is restoring the session (`status == checking`). |
| `/login`, `/signup` | Unauthenticated screens. |
| `/feed`, `/opportunities`, `/chat`, `/profile` | The four bottom-nav tabs, as branches of a `StatefulShellRoute.indexedStack`. Each branch keeps its own `Navigator` and screen state when switching tabs, same as the previous manual `IndexedStack`. |
| `/chat/:conversationId` | Pushed full-screen. Resolves the id to a `Conversation` (`ChatRepository.getConversation`) before rendering `ConversationScreen`, so it also works as a cold-start deep link. |
| `/profile/:userId` | Pushed full-screen. A read-only view of a third party's profile (`UserProfileCubit` + `UserProfileScreen`), separate from the session-scoped `ProfileCubit` used by the `/profile` tab, which only ever holds the signed-in user's own profile. |
| `/posts/:postId` | Placeholder (`PostDetailScreen`). `GET /posts/get/{postId}` exists on the API but returns a different DTO shape (`ResponseDTO<PostDTO>`) than the feed list; a real detail view is deferred to the typed-contracts phase. |

A top-level `redirect` reads `AuthCubit.state.status` and re-runs on every auth change via a `GoRouterRefreshStream` (adapts `AuthCubit.stream` into a `Listenable`): unauthenticated goes to `/login`, authenticated while on `/login`/`/signup`/`/splash` goes to `/feed`, and `checking` goes to `/splash`. The session-scoped `MultiBlocProvider` (`FeedCubit`, `OpportunitiesCubit`, `ChatCubit`, `ProfileCubit`, keyed by `ValueKey(user.id)`) is built inside the shell route's `builder`, so it exists only while authenticated, matching the scoping described above.
