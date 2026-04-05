package com.weunite.api.admin.moderation.dto;

import jakarta.validation.constraints.NotNull;

public record ReactivateUserRequestDTO(@NotNull Long userId) {}
