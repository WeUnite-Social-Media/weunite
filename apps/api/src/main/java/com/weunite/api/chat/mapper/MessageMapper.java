package com.weunite.api.chat.mapper;

import com.weunite.api.chat.domain.Message;
import com.weunite.api.chat.dto.MessageDTO;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MessageMapper {

  @Mapping(target = "conversationId", source = "conversation.id")
  @Mapping(target = "senderId", source = "sender.id")
  MessageDTO toDTO(Message message);

  List<MessageDTO> toDTOList(List<Message> messages);
}
