# API Notifications Agent Notes

## Scope

This module owns in-app notifications in `com.weunite.api.notifications`.

## Responsibilities

- Expose notification listing and read-state endpoints.
- Persist notification domain data and unread counts.
- Publish notification events to websocket subscribers.

## Does not own

- Feed, follow, chat, or opportunity business decisions that trigger notifications.
- Platform-wide websocket/security configuration from `common`.

## Key entrypoints

- `controller/NotificationController.java`
- `service/NotificationService.java`
- `repository/NotificationRepository.java`

## Core use cases

- Create notifications from cross-module side effects.
- List notifications for a user.
- Mark notifications as read and delete them.

## Working rules

- Keep trigger decisions in the owning feature service and centralize persistence/delivery here.
- Keep notification DTOs and mappings inside this module.
- Scope notification reads, read-state changes, and deletions to the authenticated recipient.
- Preserve notification endpoint contracts unless explicitly requested.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Notification contracts or websocket delivery rules change.
- Ownership boundaries with feed, follow, chat, or opportunities move.
