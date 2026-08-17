package com.weunite.api.chat.service;

import com.weunite.api.chat.domain.UserPresence;
import com.weunite.api.chat.dto.UserStatusDTO;
import com.weunite.api.chat.repository.UserPresenceRepository;
import com.weunite.api.common.exception.UnauthorizedException;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class UserStatusService {

  /** Maximum minutes a user can remain ONLINE without a heartbeat before being treated as stale. */
  static final long ONLINE_TTL_MINUTES = 2L;

  private final UserPresenceRepository userPresenceRepository;

  public UserStatusService(UserPresenceRepository userPresenceRepository) {
    this.userPresenceRepository = userPresenceRepository;
  }

  /**
   * Clears stale ONLINE rows on application startup so that presence from a previous run does not
   * appear as online after a restart.
   */
  @EventListener(ApplicationReadyEvent.class)
  @Transactional
  public void clearStaleOnlinePresenceOnStartup() {
    int cleared = userPresenceRepository.markAllOnlineAsOffline();
    if (cleared > 0) {
      log.info("Cleared {} stale ONLINE presence row(s) on startup", cleared);
    }
  }

  @Transactional
  public UserStatusDTO updateUserStatus(Long userId, String status) {
    UserPresence userPresence = new UserPresence(userId, normalizeStatus(status));
    UserPresence savedPresence = userPresenceRepository.save(userPresence);
    return new UserStatusDTO(
        savedPresence.getUserId(), savedPresence.getStatus(), savedPresence.getUpdatedAt());
  }

  /**
   * Returns the stored presence status, treating ONLINE rows that haven't been updated within
   * {@link #ONLINE_TTL_MINUTES} as OFFLINE to guard against stale data.
   */
  @Transactional(readOnly = true)
  public UserStatusDTO getUserStatus(Long userId) {
    return userPresenceRepository
        .findById(userId)
        .map(presence -> resolveStatus(userId, presence))
        .orElse(new UserStatusDTO(userId, "OFFLINE", LocalDateTime.now()));
  }

  public Long requireAuthenticatedUserId(SimpMessageHeaderAccessor headerAccessor) {
    Object userId =
        headerAccessor != null && headerAccessor.getSessionAttributes() != null
            ? headerAccessor.getSessionAttributes().get("userId")
            : null;

    if (userId instanceof Number number) {
      return number.longValue();
    }

    if (userId instanceof String value && !value.isBlank()) {
      try {
        return Long.parseLong(value);
      } catch (NumberFormatException exception) {
        throw new UnauthorizedException("Identificador invalido na sessao websocket");
      }
    }

    throw new UnauthorizedException("Usuario autenticado nao encontrado na sessao websocket");
  }

  private UserStatusDTO resolveStatus(Long userId, UserPresence presence) {
    String effectiveStatus = presence.getStatus();

    if ("ONLINE".equals(effectiveStatus)) {
      LocalDateTime staleThreshold = LocalDateTime.now().minusMinutes(ONLINE_TTL_MINUTES);
      if (presence.getUpdatedAt().isBefore(staleThreshold)) {
        effectiveStatus = "OFFLINE";
      }
    }

    return new UserStatusDTO(userId, effectiveStatus, presence.getUpdatedAt());
  }

  private String normalizeStatus(String status) {
    if (status == null) {
      return "OFFLINE";
    }

    return switch (status.trim().toUpperCase()) {
      case "ONLINE" -> "ONLINE";
      case "OFFLINE" -> "OFFLINE";
      default -> "OFFLINE";
    };
  }
}
