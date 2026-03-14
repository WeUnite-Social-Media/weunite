package com.weunite.api.chat.dto;

import com.weunite.api.chat.domain.Message;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SendMessageRequestDTO(
    @NotNull(message = "Conversation ID is required") Long conversationId,
    @NotNull(message = "Sender ID is required") Long senderId,
    @NotBlank(message = "Message content cannot be empty") String content,
    Message.MessageType type) {
  public SendMessageRequestDTO {
    if (type == null) {
      type = Message.MessageType.TEXT;
    }
  }
}
