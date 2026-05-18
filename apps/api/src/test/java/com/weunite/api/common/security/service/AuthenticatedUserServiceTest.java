package com.weunite.api.common.security.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.weunite.api.common.exception.UnauthorizedException;
import com.weunite.api.users.domain.Role;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class AuthenticatedUserServiceTest {

  @Mock private UserRepository userRepository;

  private AuthenticatedUserService authenticatedUserService;

  @Test
  @DisplayName("Should resolve authenticated user id from the token claims")
  void requireUserIdReadsIdClaim() {
    authenticatedUserService = new AuthenticatedUserService(userRepository);

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
    authenticatedUserService = new AuthenticatedUserService(userRepository);

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

  @Test
  @DisplayName("Should require admin role for admin-only actions")
  void requireAdminUserIdRejectsNonAdminUser() {
    authenticatedUserService = new AuthenticatedUserService(userRepository);

    Jwt jwt =
        Jwt.withTokenValue("token")
            .header("alg", "none")
            .subject("test-user")
            .claim("id", "15")
            .build();

    User user = new User();
    user.setId(15L);
    user.setRole(java.util.Set.of(new Role(4L, "ATHLETE")));

    when(userRepository.findByIdWithRoles(15L)).thenReturn(Optional.of(user));

    UnauthorizedException exception =
        assertThrows(
            UnauthorizedException.class, () -> authenticatedUserService.requireAdminUserId(jwt));

    assertEquals("Acao restrita a administradores", exception.getMessage());
  }
}
