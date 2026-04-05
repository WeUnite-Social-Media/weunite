import type { User } from "./user.types";

export interface Follower {
  id: string;
  follower: User;
  followed: User;
  status: string;
  createdAt: string;
  updateAt: string;
}

export interface GetFollowers {
  id: number;
}

export interface GetFollowing {
  id: number;
}

export interface GetFollow {
  followerId: number;
  followedId: number;
}

export interface FollowAndUnfollow {
  followerId: number;
  followedId: number;
}
