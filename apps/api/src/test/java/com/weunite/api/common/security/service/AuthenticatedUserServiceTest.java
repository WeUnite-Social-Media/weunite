package com.weunite.api.common.security.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.weunite.api.common.exception.UnauthorizedException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class AuthenticatedUserServiceTest {

  private final AuthenticatedUserService authenticatedUserService = new AuthenticatedUserService();

  @Test
  @DisplayName("Should resolve authenticated user id from the token claims")
  void requireUserIdReadsIdClaim() {
    Jwt jwt =
        Jwt.withTokenValue("token")
            .header("alg", "none")
            .subject("test-user")
            .claim("id", "15")
            .build();

    Long result = authenticatedUserService.requireUserId(jwt);

    assertEquals(15L, result);
  }

  @Test
  @DisplayName("Should reject mismatched user ids")
  void requireMatchingUserIdRejectsMismatch() {
    Jwt jwt =
        Jwt.withTokenValue("token")
            .header("alg", "none")
            .subject("test-user")
            .claim("id", "15")
            .build();

    UnauthorizedException exception =
        assertThrows(
            UnauthorizedException.class,
            () -> authenticatedUserService.requireMatchingUserId(jwt, 20L));

    assertEquals("Acao nao permitida para outro usuario", exception.getMessage());
  }
}
