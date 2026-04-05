package com.weunite.api.chat.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.weunite.api.chat.domain.Message;
import java.time.Instant;

public record MessageDTO(
    Long id,
    Long conversationId,
    Long senderId,
    String content,
    @JsonProperty("isRead") boolean isRead,
    Instant createdAt,
    Instant readAt,
    Message.MessageType type,
    boolean deleted,
    boolean edited,
    Instant editedAt) {}
