package com.weunite.api.notifications.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.weunite.api.notifications.domain.NotificationType;
import java.time.Instant;

public record NotificationDTO(
    Long id,
    Long userId,
    NotificationType type,
    Long actorId,
    String actorName,
    String actorUsername,
    String actorProfileImg,
    Long relatedEntityId,
    String message,
    @JsonProperty("isRead") boolean isRead,
    Instant createdAt) {}
