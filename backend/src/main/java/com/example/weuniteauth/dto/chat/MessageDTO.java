package com.example.weuniteauth.dto.chat;

import com.example.weuniteauth.domain.chat.Message;

import java.time.Instant;

public record MessageDTO(
        Long id,
        Long conversationId,
        Long senderId,
        String content,
        boolean isRead,
        Instant createdAt,
        Instant readAt,
        Message.MessageType type
) {}
