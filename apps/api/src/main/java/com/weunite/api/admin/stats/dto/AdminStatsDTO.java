package com.weunite.api.admin.stats.dto;

public record AdminStatsDTO(
    Long totalPosts,
    Long totalOpportunities,
    Long activeUsers,
    Double engagementRate,
    PreviousMonthStatsDTO previousMonth) {}
