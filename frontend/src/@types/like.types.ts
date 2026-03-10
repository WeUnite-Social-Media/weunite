import type { Post } from "./post.types";
import type { User } from "./user.types";

export interface ToggleLike {
  userId: string;
  postId: string | "";
  commentId: string | "";
}

export interface ToggleLikeComment {
  userId: string;
  commentId: string;
}

export interface Like {
  id: string;
  createdAt: string;
  updatedAt: string;
  post: Post;
  user: User;
}
