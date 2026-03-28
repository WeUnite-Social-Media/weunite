package com.weunite.api.common.security.service;

import com.weunite.api.common.exception.UnauthorizedException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class AuthenticatedUserService {

  public Long requireMatchingUserId(Jwt jwt, Long requestedUserId) {
    Long authenticatedUserId = requireUserId(jwt);

    if (!authenticatedUserId.equals(requestedUserId)) {
      throw new UnauthorizedException("Acao nao permitida para outro usuario");
    }

    return authenticatedUserId;
  }

  public Long requireUserId(Jwt jwt) {
    if (jwt == null) {
      throw new UnauthorizedException("Usuario autenticado nao encontrado");
    }

    Long userId = extractClaimAsLong(jwt, "id");
    if (userId != null) {
      return userId;
    }

    userId = extractClaimAsLong(jwt, "userId");
    if (userId != null) {
      return userId;
    }

    userId = extractClaimAsLong(jwt, "user_id");
    if (userId != null) {
      return userId;
    }

    throw new UnauthorizedException("Token sem identificador de usuario");
  }

  private Long extractClaimAsLong(Jwt jwt, String claimName) {
    Object claimValue = jwt.getClaim(claimName);
    if (claimValue == null) {
      return null;
    }

    try {
      if (claimValue instanceof Number number) {
        return number.longValue();
      }

      if (claimValue instanceof String value && !value.isBlank()) {
        return Long.parseLong(value);
      }
    } catch (NumberFormatException exception) {
      throw new UnauthorizedException("Token com identificador de usuario invalido");
    }

    throw new UnauthorizedException("Token com identificador de usuario invalido");
  }
}
