package com.weunite.api.chat.dto;

import jakarta.validation.constraints.NotNull;

public record MarkMessagesAsReadRequestDTO(@NotNull Long conversationId, @NotNull Long userId) {}
