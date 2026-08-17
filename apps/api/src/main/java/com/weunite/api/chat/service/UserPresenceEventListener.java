package com.weunite.api.chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserPresenceEventListener {

  private final UserStatusService userStatusService;

  /**
   * Marks the user OFFLINE when their WebSocket session disconnects.
   *
   * <p>Session attributes are populated by the WebSocket handshake interceptor that stores the
   * authenticated userId when the connection is established. If the session has no userId (e.g.
   * unauthenticated or test connections), the event is silently ignored.
   */
  @EventListener
  public void handleSessionDisconnect(SessionDisconnectEvent event) {
    SimpMessageHeaderAccessor accessor =
        SimpMessageHeaderAccessor.wrap(event.getMessage());

    Object rawUserId =
        accessor.getSessionAttributes() != null
            ? accessor.getSessionAttributes().get("userId")
            : null;

    if (rawUserId == null) {
      return;
    }

    Long userId = parseUserId(rawUserId);

    if (userId == null) {
      return;
    }

    try {
      userStatusService.updateUserStatus(userId, "OFFLINE");
      log.debug("Marked user {} OFFLINE on WebSocket disconnect", userId);
    } catch (Exception ex) {
      log.warn("Failed to mark user {} OFFLINE on disconnect: {}", userId, ex.getMessage());
    }
  }

  private Long parseUserId(Object raw) {
    if (raw instanceof Number number) {
      return number.longValue();
    }

    if (raw instanceof String value && !value.isBlank()) {
      try {
        return Long.parseLong(value);
      } catch (NumberFormatException ignored) {
        return null;
      }
    }

    return null;
  }
}
