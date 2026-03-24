# API Chat Agent Notes

## Scope

This module owns chat conversations, messages, and user chat presence in `com.weunite.api.chat`.

## Responsibilities

- Expose chat endpoints for conversations and messages.
- Expose user status endpoints for chat availability.
- Persist and map chat domain entities.

## Does not own

- Platform-wide websocket/security infrastructure from `common`.
- Social feed and reporting/moderation logic.

## Key entrypoints

- `controller/ChatController.java`
- `controller/ConversationController.java`
- `controller/UserStatusController.java`
- `service/MessageService.java`
- `service/ConversationService.java`
- `service/UserStatusService.java`

## Core use cases

- Send and list messages by conversation.
- Edit and delete messages by conversation.
- Manage user conversations.
- Update and query user chat status.

## Working rules

- Keep transport concerns in controllers and domain logic in services.
- Keep chat DTO/entity mappings inside this module.
- Preserve existing message and conversation contracts unless explicitly requested.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Chat endpoints or message lifecycle flows change.
- Conversation/status ownership changes.
