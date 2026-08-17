package com.weunite.api.opportunities.mapper;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.domain.Subscriber;
import com.weunite.api.opportunities.dto.SubscriberDTO;
import java.util.List;
import java.util.stream.Collectors;

public interface SubscribersMapper {

  SubscriberDTO toSubscriberDTO(Subscriber subscriber);

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
