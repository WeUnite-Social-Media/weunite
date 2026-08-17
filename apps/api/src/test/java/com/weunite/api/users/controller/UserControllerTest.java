package com.weunite.api.users.controller;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.users.dto.UpdateUserRequestDTO;
import com.weunite.api.users.dto.UserDTO;
import com.weunite.api.users.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

  @Mock private UserService userService;
  @Mock private AuthenticatedUserService authenticatedUserService;

  @InjectMocks private UserController userController;

  @Test
  @DisplayName("Should use the authenticated username for profile updates")
  void updateUserUsesAuthenticatedUsername() {
    Jwt jwt = mock(Jwt.class);
    UpdateUserRequestDTO request = mock(UpdateUserRequestDTO.class);
    ResponseDTO<UserDTO> expected = new ResponseDTO<>("ok", null);

    when(authenticatedUserService.requireMatchingUsername(jwt, "current")).thenReturn("current");
    when(userService.updateUser(request, "current", null, null)).thenReturn(expected);

    ResponseEntity<ResponseDTO<UserDTO>> result =
        userController.updateUser(jwt, "current", request, null, null);

    assertSame(expected, result.getBody());
    verify(userService).updateUser(request, "current", null, null);
  }

  @Test
  @DisplayName("Should use the authenticated username for account deletion")
  void deleteUserUsesAuthenticatedUsername() {
    Jwt jwt = mock(Jwt.class);
    ResponseDTO<UserDTO> expected = new ResponseDTO<>("ok", null);

    when(authenticatedUserService.requireMatchingUsername(jwt, "current")).thenReturn("current");
    when(userService.deleteUser("current")).thenReturn(expected);

    ResponseEntity<ResponseDTO<UserDTO>> result = userController.deleteUser(jwt, "current");

    assertSame(expected, result.getBody());
    verify(userService).deleteUser("current");
  }

  @Test
  @DisplayName("Should use the authenticated username for banner deletion")
  void deleteBannerUsesAuthenticatedUsername() {
    Jwt jwt = mock(Jwt.class);
    ResponseDTO<UserDTO> expected = new ResponseDTO<>("ok", null);

    when(authenticatedUserService.requireMatchingUsername(jwt, "current")).thenReturn("current");
    when(userService.deleteBanner("current")).thenReturn(expected);

    ResponseEntity<ResponseDTO<UserDTO>> result = userController.deleteBanner(jwt, "current");

    assertSame(expected, result.getBody());
    verify(userService).deleteBanner("current");
  }
}
