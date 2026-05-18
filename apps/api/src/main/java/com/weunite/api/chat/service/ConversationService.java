package com.weunite.api.chat.service;

import com.weunite.api.chat.domain.Conversation;
import com.weunite.api.chat.dto.ConversationDTO;
import com.weunite.api.chat.dto.CreateConversationRequestDTO;
import com.weunite.api.chat.mapper.ConversationMapper;
import com.weunite.api.chat.repository.ConversationRepository;
import com.weunite.api.chat.repository.MessageRepository;
import com.weunite.api.common.exception.NotFoundResourceException;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConversationService {

  private final ConversationRepository conversationRepository;
  private final UserRepository userRepository;
  private final MessageRepository messageRepository;
  private final ConversationMapper conversationMapper;

  @Transactional
  public ConversationDTO createConversation(CreateConversationRequestDTO request) {
    User initiator =
        userRepository
            .findById(request.initiatorUserId())
            .orElseThrow(
                () ->
                    new NotFoundResourceException(
                        "User not found with id: " + request.initiatorUserId()));

    Set<User> participants = new HashSet<>();
    participants.add(initiator);

    for (Long participantId : request.participantIds()) {
      User participant =
          userRepository
              .findById(participantId)
              .orElseThrow(
                  () -> new NotFoundResourceException("User not found with id: " + participantId));
      participants.add(participant);
    }

    // Check if conversation already exists between two users
    if (participants.size() == 2) {
      List<User> userList = participants.stream().toList();
      var existingConversation =
          conversationRepository.findConversationBetweenTwoUsers(
              userList.get(0).getId(), userList.get(1).getId());
      if (existingConversation.isPresent()) {
        return conversationMapper.toDTO(existingConversation.get(), request.initiatorUserId());
      }
    }

    Conversation conversation = new Conversation();
    conversation.setParticipants(participants);

    Conversation savedConversation = conversationRepository.save(conversation);
    return conversationMapper.toDTO(savedConversation, request.initiatorUserId());
  }

  @Transactional(readOnly = true)
  public List<ConversationDTO> getUserConversations(Long userId) {
    if (!userRepository.existsById(userId)) {
      throw new NotFoundResourceException("User not found with id: " + userId);
    }

    List<Conversation> conversations = conversationRepository.findAllByUserId(userId);
    return conversations.stream()
        .map(conversation -> conversationMapper.toDTO(conversation, userId))
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public ConversationDTO getConversationById(Long conversationId, Long userId) {
    Conversation conversation =
        conversationRepository
            .findByIdWithParticipants(conversationId)
            .orElseThrow(
                () ->
                    new NotFoundResourceException(
                        "Conversation not found with id: " + conversationId));

    boolean isParticipant =
        conversation.getParticipants().stream().anyMatch(user -> user.getId().equals(userId));

    if (!isParticipant) {
      throw new NotFoundResourceException("User is not a participant of this conversation");
    }

    return conversationMapper.toDTO(conversation, userId);
  }
}
