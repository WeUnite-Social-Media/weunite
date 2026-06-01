package com.weunite.api.common.security.service;

import com.weunite.api.common.exception.UnauthorizedException;
import com.weunite.api.users.domain.Role;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class AuthenticatedUserService {

  private final UserRepository userRepository;

  public AuthenticatedUserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Long requireMatchingUserId(Jwt jwt, Long requestedUserId) {
    Long authenticatedUserId = requireUserId(jwt);

    if (!authenticatedUserId.equals(requestedUserId)) {
      throw new UnauthorizedException("Acao nao permitida para outro usuario");
    }

    return authenticatedUserId;
  }

  public String requireMatchingUsername(Jwt jwt, String requestedUsername) {
    Long authenticatedUserId = requireUserId(jwt);
    User authenticatedUser =
        userRepository
            .findById(authenticatedUserId)
            .orElseThrow(() -> new UnauthorizedException("Usuario autenticado nao encontrado"));

    if (!authenticatedUser.getUsername().equalsIgnoreCase(requestedUsername)) {
      throw new UnauthorizedException("Acao nao permitida para outro usuario");
    }

    return authenticatedUser.getUsername();
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

  public Long requireAdminUserId(Jwt jwt) {
    Long authenticatedUserId = requireUserId(jwt);
    User user =
        userRepository
            .findByIdWithRoles(authenticatedUserId)
            .orElseThrow(() -> new UnauthorizedException("Usuario autenticado nao encontrado"));

    boolean isAdmin =
        user.getRole().stream().map(Role::getName).anyMatch("ADMIN"::equalsIgnoreCase);

    if (!isAdmin) {
      throw new UnauthorizedException("Acao restrita a administradores");
    }

    return authenticatedUserId;
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
