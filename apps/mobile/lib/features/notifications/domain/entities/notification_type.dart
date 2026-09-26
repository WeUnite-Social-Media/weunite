/// Mirrors the backend's `NotificationType` enum
/// (`apps/api` notification entity), plus [unknown] as a fallback for a type
/// the backend adds later — parsing must not break when that happens.
enum NotificationType {
  postLike,
  postComment,
  commentLike,
  commentReply,
  newFollower,
  newMessage,
  postRepost,
  opportunitySubscription,
  unknown,
}
