package com.example.weuniteauth.mapper;

import com.example.weuniteauth.domain.chat.Message;
import com.example.weuniteauth.dto.chat.MessageDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MessageMapper {

    @Mapping(target = "conversationId", source = "conversation.id")
    @Mapping(target = "senderId", source = "sender.id")
    MessageDTO toDTO(Message message);

    List<MessageDTO> toDTOList(List<Message> messages);
}
