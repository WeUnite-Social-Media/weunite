package com.weunite.api.chat.service;

import com.weunite.api.chat.domain.Conversation;
import com.weunite.api.chat.domain.Message;
import com.weunite.api.chat.dto.MessageDTO;
import com.weunite.api.chat.dto.SendMessageRequestDTO;
import com.weunite.api.chat.mapper.MessageMapper;
import com.weunite.api.chat.repository.ConversationRepository;
import com.weunite.api.chat.repository.MessageRepository;
import com.weunite.api.common.exception.BusinessRuleException;
import com.weunite.api.common.exception.NotFoundResourceException;
import com.weunite.api.common.exception.UnauthorizedException;
import com.weunite.api.notifications.domain.NotificationType;
import com.weunite.api.notifications.service.NotificationService;
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
  private final NotificationService notificationService;

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

    Long senderId = sender.getId();
    conversation.getParticipants().stream()
        .filter(participant -> !participant.getId().equals(senderId))
        .forEach(
            recipient ->
                notificationService.createNotification(
                    recipient.getId(),
                    NotificationType.NEW_MESSAGE,
                    senderId,
                    conversation.getId(),
                    null));

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
    Instant now = Instant.now();

    for (Message message : unreadMessages) {
      if (!message.isRead()) {
        message.setRead(true);
        message.setReadAt(now);
      }
    }

    messageRepository.saveAll(unreadMessages);
  }

  @Transactional
  public MessageDTO deleteMessage(Long messageId, Long userId) {
    Message message =
        messageRepository
            .findById(messageId)
            .orElseThrow(
                () -> new NotFoundResourceException("Message not found with id: " + messageId));

    if (!message.getSender().getId().equals(userId)) {
      throw new UnauthorizedException("Você não tem permissão para apagar esta mensagem");
    }

    if (!message.isDeleted()) {
      message.setDeleted(true);
      message.setEdited(false);
      message.setEditedAt(null);
      message.setContent("Mensagem apagada");
      messageRepository.save(message);
    }

    return messageMapper.toDTO(message);
  }

  @Transactional
  public MessageDTO editMessage(Long messageId, Long userId, String newContent) {
    Message message =
        messageRepository
            .findById(messageId)
            .orElseThrow(
                () -> new NotFoundResourceException("Message not found with id: " + messageId));

    if (!message.getSender().getId().equals(userId)) {
      throw new UnauthorizedException("Você não tem permissão para editar esta mensagem");
    }

    if (message.isDeleted()) {
      throw new BusinessRuleException("Não é possível editar uma mensagem apagada");
    }

    if (message.getType() != Message.MessageType.TEXT) {
      throw new BusinessRuleException("Apenas mensagens de texto podem ser editadas");
    }

    String normalizedContent = newContent == null ? "" : newContent.trim();
    if (normalizedContent.isEmpty()) {
      throw new BusinessRuleException("O conteúdo da mensagem não pode ficar vazio");
    }

    message.setContent(normalizedContent);
    message.setEdited(true);
    message.setEditedAt(Instant.now());

    Message savedMessage = messageRepository.save(message);
    return messageMapper.toDTO(savedMessage);
  }
}
