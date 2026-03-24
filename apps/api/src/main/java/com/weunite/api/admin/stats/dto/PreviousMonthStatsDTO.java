package com.weunite.api.admin.stats.dto;

public record PreviousMonthStatsDTO(
    Long posts, Long opportunities, Long activeUsers, Double engagementRate) {}
