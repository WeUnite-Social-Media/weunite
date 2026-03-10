package com.example.weuniteauth.dto.chat;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record CreateConversationRequestDTO(
        @NotNull(message = "Initiator user ID is required")
        Long initiatorUserId,

        @NotEmpty(message = "At least one participant is required")
        Set<Long> participantIds
) {}
