package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.weunite.api.chat.domain.Conversation;
import com.weunite.api.chat.domain.Message;
import com.weunite.api.chat.dto.MessageDTO;
import com.weunite.api.chat.dto.SendMessageRequestDTO;
import com.weunite.api.chat.mapper.MessageMapper;
import com.weunite.api.chat.repository.ConversationRepository;
import com.weunite.api.chat.repository.MessageRepository;
import com.weunite.api.chat.service.MessageService;
import com.weunite.api.common.exception.UnauthorizedException;
import com.weunite.api.notifications.domain.NotificationType;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class MessageServiceTest {

  @Mock private MessageRepository messageRepository;
  @Mock private ConversationRepository conversationRepository;
  @Mock private UserRepository userRepository;
  @Mock private MessageMapper messageMapper;
  @Mock private NotificationService notificationService;

  @InjectMocks private MessageService messageService;

  @Test
  @DisplayName("Should send message and notify the other conversation participants")
  void sendMessageSuccess() {
    Long conversationId = 1L;
    Long senderId = 10L;
    Long recipientId = 20L;

    User sender = new User();
    sender.setId(senderId);

    User recipient = new User();
    recipient.setId(recipientId);

    Conversation conversation = new Conversation();
    conversation.setId(conversationId);
    conversation.setParticipants(Set.of(sender, recipient));

    SendMessageRequestDTO request =
        new SendMessageRequestDTO(
            conversationId, senderId, "hello world", Message.MessageType.TEXT);

    Message savedMessage = new Message();
    savedMessage.setId(100L);
    savedMessage.setConversation(conversation);
    savedMessage.setSender(sender);
    savedMessage.setContent("hello world");
    savedMessage.setType(Message.MessageType.TEXT);

    MessageDTO expectedMessage =
        new MessageDTO(
            100L,
            conversationId,
            senderId,
            "hello world",
            false,
            Instant.now(),
            null,
            Message.MessageType.TEXT,
            false,
            false,
            null);

    when(conversationRepository.findByIdWithParticipants(conversationId))
        .thenReturn(Optional.of(conversation));
    when(userRepository.findById(senderId)).thenReturn(Optional.of(sender));
    when(messageRepository.save(any(Message.class))).thenReturn(savedMessage);
    when(conversationRepository.save(conversation)).thenReturn(conversation);
    when(messageMapper.toDTO(savedMessage)).thenReturn(expectedMessage);

    MessageDTO result = messageService.sendMessage(request);

    assertEquals(expectedMessage, result);
    verify(notificationService)
        .createNotification(
            recipientId, NotificationType.NEW_MESSAGE, senderId, conversationId, null);
  }

  @Test
  @DisplayName("Should edit text message and set edited metadata")
  void editMessageSuccess() {
    Long messageId = 1L;
    Long userId = 10L;

    User sender = new User();
    sender.setId(userId);

    Message message = new Message();
    message.setId(messageId);
    message.setSender(sender);
    message.setType(Message.MessageType.TEXT);
    message.setContent("old");

    MessageDTO expectedMessage =
        new MessageDTO(
            messageId,
            1L,
            userId,
            "new content",
            false,
            Instant.now(),
            null,
            Message.MessageType.TEXT,
            false,
            true,
            Instant.now());

    when(messageRepository.findByIdWithSender(messageId)).thenReturn(Optional.of(message));
    when(messageRepository.save(message)).thenReturn(message);
    when(messageMapper.toDTO(message)).thenReturn(expectedMessage);

    MessageDTO result = messageService.editMessage(messageId, userId, "  new content  ");

    assertNotNull(result);
    assertEquals("new content", message.getContent());
    assertTrue(message.isEdited());
    assertNotNull(message.getEditedAt());
  }

  @Test
  @DisplayName("Should soft delete message content for the sender")
  void deleteMessageSuccess() {
    Long messageId = 1L;
    Long userId = 10L;

    User sender = new User();
    sender.setId(userId);

    Message message = new Message();
    message.setId(messageId);
    message.setSender(sender);
    message.setContent("secret");
    message.setType(Message.MessageType.TEXT);

    MessageDTO expectedMessage =
        new MessageDTO(
            messageId,
            1L,
            userId,
            "Mensagem apagada",
            false,
            Instant.now(),
            null,
            Message.MessageType.TEXT,
            true,
            false,
            null);

    when(messageRepository.findByIdWithSender(messageId)).thenReturn(Optional.of(message));
    when(messageRepository.save(message)).thenReturn(message);
    when(messageMapper.toDTO(message)).thenReturn(expectedMessage);

    MessageDTO result = messageService.deleteMessage(messageId, userId);

    assertEquals(expectedMessage, result);
    assertTrue(message.isDeleted());
    assertEquals("Mensagem apagada", message.getContent());
  }

  @Test
  @DisplayName("Should reject delete when requester is not the sender")
  void deleteMessageRejectsNonSender() {
    Long messageId = 1L;

    User sender = new User();
    sender.setId(10L);

    Message message = new Message();
    message.setId(messageId);
    message.setSender(sender);
    message.setContent("secret");
    message.setType(Message.MessageType.TEXT);

    when(messageRepository.findByIdWithSender(messageId)).thenReturn(Optional.of(message));

    UnauthorizedException exception =
        assertThrows(
            UnauthorizedException.class, () -> messageService.deleteMessage(messageId, 20L));

    assertTrue(exception.getMessage().contains("apagar esta mensagem"));
    verifyNoInteractions(messageMapper);
  }
}
