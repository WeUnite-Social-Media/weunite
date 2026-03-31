package com.weunite.api.chat.service;

import com.weunite.api.chat.dto.UserStatusDTO;
import com.weunite.api.common.exception.UnauthorizedException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Service;

@Service
public class UserStatusService {

  private final Map<Long, UserStatusDTO> userStatusMap = new ConcurrentHashMap<>();

  public UserStatusDTO updateUserStatus(Long userId, String status) {
    UserStatusDTO normalizedStatus =
        new UserStatusDTO(userId, normalizeStatus(status), LocalDateTime.now());
    userStatusMap.put(userId, normalizedStatus);
    return normalizedStatus;
  }

  public UserStatusDTO getUserStatus(Long userId) {
    UserStatusDTO status = userStatusMap.get(userId);

    if (status == null) {
      return new UserStatusDTO(userId, "OFFLINE", LocalDateTime.now());
    }

    return status;
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
