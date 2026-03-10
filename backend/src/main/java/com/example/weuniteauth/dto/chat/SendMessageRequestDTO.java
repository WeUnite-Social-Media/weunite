package com.example.weuniteauth.dto.chat;

import com.example.weuniteauth.domain.chat.Message;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SendMessageRequestDTO(
        @NotNull(message = "Conversation ID is required")
        Long conversationId,

        @NotNull(message = "Sender ID is required")
        Long senderId,

        @NotBlank(message = "Message content cannot be empty")
        String content,

        Message.MessageType type
) {
    public SendMessageRequestDTO {
        if (type == null) {
            type = Message.MessageType.TEXT;
        }
    }
}
