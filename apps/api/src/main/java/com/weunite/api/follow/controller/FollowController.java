package com.weunite.api.follow.controller;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.follow.dto.FollowDTO;
import com.weunite.api.follow.service.FollowService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

  private final FollowService followService;
  private final AuthenticatedUserService authenticatedUserService;

  public FollowController(
      FollowService followService, AuthenticatedUserService authenticatedUserService) {
    this.followService = followService;
    this.authenticatedUserService = authenticatedUserService;
  }

  @PostMapping("/followAndUnfollow/{followerId}/{followedId}")
  public ResponseEntity<ResponseDTO<FollowDTO>> followAndUnfollow(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long followerId,
      @PathVariable Long followedId) {
    Long authenticatedFollowerId = authenticatedUserService.requireMatchingUserId(jwt, followerId);
    ResponseDTO<FollowDTO> result =
        followService.followAndUnfollow(authenticatedFollowerId, followedId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/get/{followerId}/{followedId}")
  public ResponseEntity<FollowDTO> getFollow(
      @PathVariable Long followerId, @PathVariable Long followedId) {
    FollowDTO result = followService.getFollow(followerId, followedId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/followers/{userId}")
  public ResponseEntity<ResponseDTO<List<FollowDTO>>> getFollowers(@PathVariable Long userId) {
    ResponseDTO<List<FollowDTO>> result = followService.getFollowers(userId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/following/{userId}")
  public ResponseEntity<ResponseDTO<List<FollowDTO>>> getFollowing(@PathVariable Long userId) {
    ResponseDTO<List<FollowDTO>> result = followService.getFollowing(userId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @PutMapping("/accept/{followerId}/{followedId}")
  public ResponseEntity<ResponseDTO<FollowDTO>> acceptFollowRequest(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long followerId,
      @PathVariable Long followedId) {
    Long authenticatedFollowedId = authenticatedUserService.requireMatchingUserId(jwt, followedId);
    ResponseDTO<FollowDTO> result =
        followService.acceptFollowRequest(followerId, authenticatedFollowedId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @PutMapping("/decline/{followerId}/{followedId}")
  public ResponseEntity<ResponseDTO<FollowDTO>> declineFollowRequest(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long followerId,
      @PathVariable Long followedId) {
    Long authenticatedFollowedId = authenticatedUserService.requireMatchingUserId(jwt, followedId);
    ResponseDTO<FollowDTO> result =
        followService.declineFollowRequest(followerId, authenticatedFollowedId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }
}
