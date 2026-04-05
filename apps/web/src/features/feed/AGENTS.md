## Scope

This feature owns the home feed, posts, comments, and likes on the web client in `apps/web/src/features/feed`.

## Responsibilities

- Render the signed-in home feed and post creation/editing flows.
- Hold post, comment, and like API adapters plus feature-local query state.
- Own feed-specific composition such as the home layout and post/comment components.

## Does not own

- Backend feed ranking, persistence, or moderation rules.
- Profile-specific ownership of user pages.
- Opportunity CRUD outside feed-side presentation.

## Key entrypoints

- `routes/HomeRoutes.tsx`
- `pages/Home.tsx`
- `api/postService.ts`
- `api/commentService.ts`
- `api/likeService.ts`
- `state/usePosts.ts`
- `state/useComments.ts`
- `state/useLikes.ts`
- `components/home/FeedHome.tsx`
- `components/post/Post.tsx`
- `components/post/CreatePost.tsx`

## Validation

- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web typecheck`
- `pnpm --filter @weunite/web build`

## Keep this file updated when

- Feed route ownership changes.
- Post/comment/like state moves between feature and shared layers.
- The feed starts owning new cross-feature surfaces.
