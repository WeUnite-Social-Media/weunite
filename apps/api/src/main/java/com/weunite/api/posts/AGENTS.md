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
- Keep entity relationships out of transport serialization; expose posts and comments through DTO mappings.
- Preserve endpoint contracts unless explicitly requested.
- Keep feed pagination database-backed; do not merge and paginate full post/repost result sets in memory.
- When materializing feed projections, preload the author/repost relations the mapper needs instead
  of relying on lazy loads inside the service loop.
- For actor-owned mutations, validate the path or request user id against the authenticated JWT
  before calling the service layer.
- Keep post-like/repost lifecycle repository-owned; post-side interaction collections are read
  views, not aggregate owners.
- Treat post removal as soft deletion: hide deleted posts from public read and interaction flows
  while retaining their persisted interaction history.
- Keep comment-thread cleanup comment-owned; deleting a comment subtree may cascade through nested
  comments and their likes.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Post/comment/like contracts or lifecycle rules change.
- Ownership boundaries with reports/admin change.
