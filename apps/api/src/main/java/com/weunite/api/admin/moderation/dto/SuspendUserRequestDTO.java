package com.weunite.api.admin.moderation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SuspendUserRequestDTO(
    @NotNull Long userId,
    @NotNull @Min(1) Integer durationInDays,
    @NotBlank String reason,
    Long reportId) {}
