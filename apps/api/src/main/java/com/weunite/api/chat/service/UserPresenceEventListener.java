package com.weunite.api.chat.service;

import java.util.Map;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class UserPresenceEventListener {

  private final UserStatusService userStatusService;

  public UserPresenceEventListener(UserStatusService userStatusService) {
    this.userStatusService = userStatusService;
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
      userStatusService.markUserOffline(userId);
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
