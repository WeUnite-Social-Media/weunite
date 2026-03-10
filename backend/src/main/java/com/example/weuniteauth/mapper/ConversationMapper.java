package com.example.weuniteauth.mapper;

import com.example.weuniteauth.domain.chat.Conversation;
import com.example.weuniteauth.domain.chat.Message;
import com.example.weuniteauth.domain.users.User;
import com.example.weuniteauth.dto.chat.ConversationDTO;
import com.example.weuniteauth.dto.chat.MessageDTO;
import com.example.weuniteauth.repository.MessageRepository;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {MessageMapper.class})
public abstract class ConversationMapper {

    @Autowired
    protected MessageRepository messageRepository;

    @Mapping(target = "participantIds", source = "participants", qualifiedByName = "mapParticipantIds")
    @Mapping(target = "lastMessage", source = "conversation", qualifiedByName = "getLastMessage")
    @Mapping(target = "unreadCount", source = "conversation", qualifiedByName = "getUnreadCount")
    public abstract ConversationDTO toDTO(Conversation conversation, @Context Long userId);

    public abstract List<ConversationDTO> toDTOList(List<Conversation> conversations, @Context Long userId);

    @Named("mapParticipantIds")
    protected Set<Long> mapParticipantIds(Set<User> participants) {
        if (participants == null || participants.isEmpty()) {
            return Set.of();
        }
        return participants.stream()
                .map(User::getId)
                .collect(Collectors.toSet());
    }

    @Named("getLastMessage")
    protected MessageDTO getLastMessage(Conversation conversation) {
        if (conversation.getMessages() == null || conversation.getMessages().isEmpty()) {
            return null;
        }

        Message lastMessage = conversation.getMessages().stream()
                .max(Comparator.comparing(Message::getCreatedAt))
                .orElse(null);

        if (lastMessage == null) {
            return null;
        }

        return new MessageDTO(
                lastMessage.getId(),
                conversation.getId(),
                lastMessage.getSender().getId(),
                lastMessage.getContent(),
                lastMessage.isRead(),
                lastMessage.getCreatedAt(),
                lastMessage.getReadAt(),
                lastMessage.getType()
        );
    }

    @Named("getUnreadCount")
    protected int getUnreadCount(Conversation conversation, @Context Long userId) {
        if (userId == null) {
            return 0;
        }
        return messageRepository.countUnreadMessagesByConversationAndUser(conversation.getId(), userId);
    }
}
