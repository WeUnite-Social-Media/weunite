package com.weunite.api.posts.dto;

import com.weunite.api.users.dto.UserSummaryDTO;
import java.time.Instant;

public record FeedPostSummaryDTO(
    String id,
    String text,
    String imageUrl,
    long likesCount,
    long commentsCount,
    boolean likedByViewer,
    Instant createdAt,
    Instant updatedAt,
    UserSummaryDTO user,
    UserSummaryDTO repostedBy,
    Instant repostedAt) {}
