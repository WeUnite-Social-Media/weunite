# API Posts Agent Notes

## Scope

This module owns posts, comments, likes, and reposts in `com.weunite.api.posts`.

## Responsibilities

- Expose endpoints for post/comment/like operations.
- Expose repost operations.
- Manage feed-oriented post retrieval.
- Persist post/comment/like/repost domain entities.

## Does not own

- Report lifecycle ownership.
- Follow graph ownership.
- Chat and auth business flows.

## Key entrypoints

- `controller/PostController.java`
- `controller/CommentController.java`
- `controller/LikeController.java`
- `service/PostService.java`
- `service/CommentService.java`
- `service/LikeService.java`
- `service/RepostService.java`

## Core use cases

- Create, update, list, and delete posts.
- Create, update, list, and delete comments.
- Like/unlike posts and comments.
- Repost and undo reposts.

## Working rules

- Keep feed, comment, and like logic in services, not controllers.
- Keep post/comment/like DTOs and mappings inside this module.
- Preserve endpoint contracts unless explicitly requested.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Post/comment/like contracts or lifecycle rules change.
- Ownership boundaries with reports/admin change.
