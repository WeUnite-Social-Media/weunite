package com.weunite.api.notifications.mapper;

import com.weunite.api.notifications.domain.Notification;
import com.weunite.api.notifications.dto.NotificationDTO;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

  @Mapping(target = "isRead", expression = "java(notification.isRead())")
  NotificationDTO toDTO(Notification notification);

  List<NotificationDTO> toDTOList(List<Notification> notifications);
}
