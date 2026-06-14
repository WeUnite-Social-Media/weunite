package com.weunite.api.posts.repository;

import java.time.Instant;

public interface FeedPostSummaryProjection {

  Long getPostId();

  String getText();

  String getImageUrl();

  Instant getCreatedAt();

  Instant getUpdatedAt();

  Long getUserId();

  String getUserName();

  String getUsername();

  String getUserProfileImg();

  Long getLikesCount();

  Long getCommentsCount();

  Boolean getLikedByViewer();

  Long getRepostedByUserId();

  String getRepostedByName();

  String getRepostedByUsername();

  String getRepostedByProfileImg();

  Instant getRepostedAt();
}
