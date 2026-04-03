package com.weunite.api.admin.moderation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BanUserRequestDTO(@NotNull Long userId, @NotBlank String reason) {}
