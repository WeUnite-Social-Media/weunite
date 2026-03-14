package com.weunite.api.chat.dto;

import com.weunite.api.chat.domain.Message;
import java.time.Instant;

public record MessageDTO(
    Long id,
    Long conversationId,
    Long senderId,
    String content,
    boolean isRead,
    Instant createdAt,
    Instant readAt,
    Message.MessageType type) {}
