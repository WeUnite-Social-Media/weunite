package com.weunite.api.chat.service;

import com.weunite.api.chat.dto.UserStatusDTO;
import java.util.Map;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class UserPresenceEventListener {

  private final UserStatusService userStatusService;
  private final SimpMessagingTemplate messagingTemplate;

  public UserPresenceEventListener(
      UserStatusService userStatusService, SimpMessagingTemplate messagingTemplate) {
    this.userStatusService = userStatusService;
    this.messagingTemplate = messagingTemplate;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void clearOnlinePresenceOnStartup() {
    userStatusService.markOnlineUsersOffline();
  }

  @EventListener
  public void markDisconnectedUserOffline(SessionDisconnectEvent event) {
    SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
    Long userId = extractUserId(accessor.getSessionAttributes());

    if (userId != null) {
      UserStatusDTO status = userStatusService.markUserOffline(userId);
      messagingTemplate.convertAndSend("/topic/user/" + userId + "/status", status);
    }
  }

  private Long extractUserId(Map<String, Object> sessionAttributes) {
    if (sessionAttributes == null) {
      return null;
    }

    Object userId = sessionAttributes.get("userId");
    if (userId instanceof Number number) {
      return number.longValue();
    }

    if (userId instanceof String value && !value.isBlank()) {
      try {
        return Long.parseLong(value);
      } catch (NumberFormatException exception) {
        return null;
      }
    }

    return null;
  }
}
