import type { Like } from "./like.types";
import type { User } from "./user.types";
import type { Comment } from "./comment.types";

export interface CreatePost {
  text: string | null;
  media?: File | null;
}

export interface UpdatePost {
  text: string | null;
  media?: File | null;
}

export interface GetPost {
  id: string;
}

export interface DeletePost {
  id: string;
}

export interface Post {
  id: string;
  text: string;
  imageUrl: string | null;
  likes: Like[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string | null;
  user: User;
}
