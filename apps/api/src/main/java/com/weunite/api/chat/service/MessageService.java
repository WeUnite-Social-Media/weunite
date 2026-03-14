package com.weunite.api.chat.service;

import com.weunite.api.chat.domain.Conversation;
import com.weunite.api.chat.domain.Message;
import com.weunite.api.chat.dto.MessageDTO;
import com.weunite.api.chat.dto.SendMessageRequestDTO;
import com.weunite.api.chat.mapper.MessageMapper;
import com.weunite.api.chat.repository.ConversationRepository;
import com.weunite.api.chat.repository.MessageRepository;
import com.weunite.api.common.exception.NotFoundResourceException;
import com.weunite.api.common.exception.UnauthorizedException;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MessageService {

  private final MessageRepository messageRepository;
  private final ConversationRepository conversationRepository;
  private final UserRepository userRepository;
  private final MessageMapper messageMapper;

  @Transactional
  public MessageDTO sendMessage(SendMessageRequestDTO request) {
    Conversation conversation =
        conversationRepository
            .findById(request.conversationId())
            .orElseThrow(
                () ->
                    new NotFoundResourceException(
                        "Conversation not found with id: " + request.conversationId()));

    User sender =
        userRepository
            .findById(request.senderId())
            .orElseThrow(
                () ->
                    new NotFoundResourceException("User not found with id: " + request.senderId()));

    boolean isParticipant =
        conversation.getParticipants().stream()
            .anyMatch(user -> user.getId().equals(sender.getId()));

    if (!isParticipant) {
      throw new UnauthorizedException("User is not a participant of this conversation");
    }

    Message message = new Message();
    message.setConversation(conversation);
    message.setSender(sender);
    message.setContent(request.content());
    message.setType(request.type());
    message.setRead(false);

    Message savedMessage = messageRepository.save(message);

    // Update conversation's updatedAt timestamp
    conversation.setUpdatedAt(Instant.now());
    conversationRepository.save(conversation);

    return messageMapper.toDTO(savedMessage);
  }

  @Transactional(readOnly = true)
  public List<MessageDTO> getConversationMessages(Long conversationId, Long userId) {
    Conversation conversation =
        conversationRepository
            .findById(conversationId)
            .orElseThrow(
                () ->
                    new NotFoundResourceException(
                        "Conversation not found with id: " + conversationId));

    boolean isParticipant =
        conversation.getParticipants().stream().anyMatch(user -> user.getId().equals(userId));

    if (!isParticipant) {
      throw new UnauthorizedException("User is not a participant of this conversation");
    }

    List<Message> messages =
        messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    return messageMapper.toDTOList(messages);
  }

  @Transactional
  public void markMessagesAsRead(Long conversationId, Long userId) {
    List<Message> unreadMessages =
        messageRepository.findUnreadMessagesByConversationAndUser(conversationId, userId);

    for (Message message : unreadMessages) {
      message.setRead(true);
      message.setReadAt(Instant.now());
    }

    messageRepository.saveAll(unreadMessages);
  }
}
