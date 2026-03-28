package com.weunite.api.posts.repository;

public interface FeedItemProjection {

  Long getPostId();

  Long getRepostId();

  String getEntryType();
}
