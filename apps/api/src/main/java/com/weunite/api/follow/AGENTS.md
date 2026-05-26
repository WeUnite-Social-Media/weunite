# API Follow Agent Notes

## Scope

This module owns user follow relationships in `com.weunite.api.follow`.

## Responsibilities

- Expose follow/unfollow and follow listing endpoints.
- Persist and query follow relationship domain data.

## Does not own

- User profile mutation outside follow relationships.
- Feed ranking logic and notifications.

## Key entrypoints

- `controller/FollowController.java`
- `service/FollowService.java`

## Core use cases

- Follow another user.
- Unfollow a user.
- Query followers/following views.

## Working rules

- Keep relationship business rules in service layer.
- Keep follow DTOs and mappers inside this module.
- Preserve follow endpoint contracts unless explicitly requested.
- Reject self-follow attempts in the service layer before persisting relationship state.
- Validate the authenticated actor against follow mutation path IDs: the follower owns follow
  toggles, and the followed user owns request acceptance or decline.
- Keep follow lifecycle repository/service-owned; user-side collections are read views, not aggregate owners.

## Validation

- `pnpm --filter @weunite/api test`
- `pnpm --filter @weunite/api build`

## Keep this file updated when

- Follow endpoints or relationship rules change.
- Ownership boundaries with users/feed modules change.
