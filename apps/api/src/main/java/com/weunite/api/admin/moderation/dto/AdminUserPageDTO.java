package com.weunite.api.admin.moderation.dto;

import java.util.List;

public record AdminUserPageDTO(
    List<AdminUserSummaryDTO> items,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean hasNext,
    boolean hasPrevious) {}
