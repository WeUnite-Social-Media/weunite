# Notifications Feature Notes

## Scope

This feature owns in-app notification UI, React Query state, and web-side realtime syncing in `apps/web/src/features/notifications`.

## Responsibilities

- Fetch notification lists and unread counts from `apps/api`.
- Render desktop and mobile notification surfaces.
- Keep notification state in sync with websocket events.

## Does not own

- Backend notification triggers or persistence rules.
- Generic websocket transport bootstrap from `src/app/providers`.
- Chat, feed, follow, or opportunity business rules.

## Key entrypoints

- `components/NotificationSync.tsx`
- `components/NotificationBell.tsx`
- `components/NotificationPanel.tsx`
- `components/NotificationList.tsx`
- `state/useNotifications.ts`
- `hooks/useNotificationRealtime.ts`

## Validation

- `pnpm --filter @weunite/web typecheck`
- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web build`

## Keep this file updated when

- Notification surfaces move between app, shared, or feature ownership.
- The realtime subscription path or cache-syncing rules change.
