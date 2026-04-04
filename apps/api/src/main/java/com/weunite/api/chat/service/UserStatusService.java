package com.weunite.api.chat.service;

import com.weunite.api.chat.domain.UserPresence;
import com.weunite.api.chat.dto.UserStatusDTO;
import com.weunite.api.chat.repository.UserPresenceRepository;
import com.weunite.api.common.exception.UnauthorizedException;
import java.time.LocalDateTime;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserStatusService {

  private final UserPresenceRepository userPresenceRepository;

  public UserStatusService(UserPresenceRepository userPresenceRepository) {
    this.userPresenceRepository = userPresenceRepository;
  }

  @Transactional
  public UserStatusDTO updateUserStatus(Long userId, String status) {
    UserPresence userPresence = new UserPresence(userId, normalizeStatus(status));
    UserPresence savedPresence = userPresenceRepository.save(userPresence);
    return new UserStatusDTO(savedPresence.getUserId(), savedPresence.getStatus(), savedPresence.getUpdatedAt());
  }

  @Transactional(readOnly = true)
  public UserStatusDTO getUserStatus(Long userId) {
    return userPresenceRepository
        .findById(userId)
        .map(
            presence ->
                new UserStatusDTO(
                    presence.getUserId(), presence.getStatus(), presence.getUpdatedAt()))
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
