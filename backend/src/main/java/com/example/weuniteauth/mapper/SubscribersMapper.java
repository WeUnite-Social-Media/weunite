package com.example.weuniteauth.mapper;

import com.example.weuniteauth.domain.opportunity.Subscriber;
import com.example.weuniteauth.dto.Opportunity.SubscriberDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface SubscribersMapper {

    @Mapping(target = "id", source = "subscriber.id", resultType = String.class)
    @Mapping(target = "opportunity", source = "subscriber.opportunity")
    @Mapping(target = "athlete", source = "subscriber.athlete")
    SubscriberDTO toSubscriberDTO(Subscriber subscriber);

    @Named("mapSubscribersToList")
    default List<SubscriberDTO>mapSubscribersToList(List<Subscriber> subscribers) {
        if (subscribers == null || subscribers.isEmpty()) {
            return List.of();
        }

       return subscribers.stream()
                .map(this::toSubscriberDTO)
                .collect(Collectors.toList());
    }

    default ResponseDTO<SubscriberDTO> toResponseDTO(String message, Subscriber subscriber) {
        SubscriberDTO subscriberDTO = toSubscriberDTO(subscriber);
        return new ResponseDTO<>(message,  subscriberDTO);
    }
}
