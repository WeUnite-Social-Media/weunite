package com.weunite.api.admin.moderation.dto;

import java.time.Instant;

public record AdminUserSummaryDTO(
    Long id,
    String name,
    String username,
    String email,
    String role,
    String profileImg,
    String status,
    Instant createdAt,
    Instant suspendedUntil,
    Instant bannedAt,
    String moderationReason,
    Long contentCount,
    Long pendingReportCount) {}
