package com.weunite.api.opportunities.mapper;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.domain.Subscriber;
import com.weunite.api.opportunities.dto.SubscriberDTO;
import com.weunite.api.users.mapper.UserMapper;
import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(
    componentModel = "spring",
    uses = {UserMapper.class, OpportunityMapper.class})
public interface SubscribersMapper {

  @Mapping(target = "id", source = "subscriber.id")
  @Mapping(target = "opportunity", source = "subscriber.opportunity")
  @Mapping(target = "athlete", source = "subscriber.athlete")
  SubscriberDTO toSubscriberDTO(Subscriber subscriber);

  @Named("mapSubscribersToList")
  default List<SubscriberDTO> mapSubscribersToList(List<Subscriber> subscribers) {
    if (subscribers == null || subscribers.isEmpty()) {
      return List.of();
    }

    return subscribers.stream().map(this::toSubscriberDTO).collect(Collectors.toList());
  }

  default ResponseDTO<SubscriberDTO> toResponseDTO(String message, Subscriber subscriber) {
    SubscriberDTO subscriberDTO = toSubscriberDTO(subscriber);
    return new ResponseDTO<>(message, subscriberDTO);
  }
}
