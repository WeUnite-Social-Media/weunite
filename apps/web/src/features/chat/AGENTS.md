## Scope

This feature owns the web chat experience in `apps/web/src/features/chat`.

## Responsibilities

- Render conversation lists, message threads, and chat composer surfaces.
- Hold chat-specific API adapters, feature state, and websocket consumption hooks.
- Coordinate online status UI with the app websocket provider.

## Does not own

- App-level websocket transport bootstrap from `src/app/providers`.
- Backend chat persistence, authorization, or presence rules.
- Notification or feed business flows.

## Key entrypoints

- `routes/ChatRoutes.tsx`
- `pages/Chat.tsx`
- `components/ChatContainer.tsx`
- `components/ConversationList.tsx`
- `components/MessageList.tsx`
- `components/MessageInput.tsx`
- `api/chatService.ts`
- `state/useChat.ts`
- `hooks/useWebSocket.ts`
- `hooks/useOnlineStatus.ts`

## Validation

- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web typecheck`
- `pnpm --filter @weunite/web build`

## Keep this file updated when

- Chat route or layout ownership changes.
- Presence or websocket consumption responsibilities move.
- Message or conversation state management changes shape.
