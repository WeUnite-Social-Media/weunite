package com.weunite.api.chat.dto;

import java.time.Instant;
import java.util.Set;

public record ConversationDTO(
    Long id,
    Set<Long> participantIds,
    MessageDTO lastMessage,
    Instant createdAt,
    Instant updatedAt,
    int unreadCount) {}
