package com.weunite.api.admin.stats.dto;

import java.util.List;

public record DashboardDataDTO(
    AdminStatsDTO stats,
    List<DashboardActivityDTO> monthlyActivity,
    List<OpportunityByCategoryDTO> opportunitiesByCategory) {}
