package com.weunite.api.follow.controller;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.follow.dto.FollowDTO;
import com.weunite.api.follow.service.FollowService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class FollowControllerTest {

  @Mock private FollowService followService;
  @Mock private AuthenticatedUserService authenticatedUserService;

  @InjectMocks private FollowController followController;

  @Test
  @DisplayName("Should use the authenticated follower for follow toggles")
  void followAndUnfollowUsesAuthenticatedFollower() {
    Jwt jwt = mock(Jwt.class);
    ResponseDTO<FollowDTO> expected = new ResponseDTO<>("ok", null);

    when(authenticatedUserService.requireMatchingUserId(jwt, 11L)).thenReturn(11L);
    when(followService.followAndUnfollow(11L, 22L)).thenReturn(expected);

    ResponseEntity<ResponseDTO<FollowDTO>> result =
        followController.followAndUnfollow(jwt, 11L, 22L);

    assertSame(expected, result.getBody());
    verify(followService).followAndUnfollow(11L, 22L);
  }

  @Test
  @DisplayName("Should use the authenticated followed user to accept requests")
  void acceptRequestUsesAuthenticatedRecipient() {
    Jwt jwt = mock(Jwt.class);
    ResponseDTO<FollowDTO> expected = new ResponseDTO<>("ok", null);

    when(authenticatedUserService.requireMatchingUserId(jwt, 22L)).thenReturn(22L);
    when(followService.acceptFollowRequest(11L, 22L)).thenReturn(expected);

    ResponseEntity<ResponseDTO<FollowDTO>> result =
        followController.acceptFollowRequest(jwt, 11L, 22L);

    assertSame(expected, result.getBody());
    verify(followService).acceptFollowRequest(11L, 22L);
  }

  @Test
  @DisplayName("Should use the authenticated followed user to decline requests")
  void declineRequestUsesAuthenticatedRecipient() {
    Jwt jwt = mock(Jwt.class);
    ResponseDTO<FollowDTO> expected = new ResponseDTO<>("ok", null);

    when(authenticatedUserService.requireMatchingUserId(jwt, 22L)).thenReturn(22L);
    when(followService.declineFollowRequest(11L, 22L)).thenReturn(expected);

    ResponseEntity<ResponseDTO<FollowDTO>> result =
        followController.declineFollowRequest(jwt, 11L, 22L);

    assertSame(expected, result.getBody());
    verify(followService).declineFollowRequest(11L, 22L);
  }
}
