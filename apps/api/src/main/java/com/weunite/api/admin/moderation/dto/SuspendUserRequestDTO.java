package com.weunite.api.admin.moderation.dto;

public record SuspendUserRequestDTO(Long userId, Integer durationInDays, String reason, Long reportId) {}
