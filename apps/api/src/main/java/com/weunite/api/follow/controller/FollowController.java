package com.weunite.api.follow.controller;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.follow.dto.FollowDTO;
import com.weunite.api.follow.service.FollowService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

  private final FollowService followService;

  public FollowController(FollowService followService) {
    this.followService = followService;
  }

  @PostMapping("/followAndUnfollow/{followerId}/{followedId}")
  public ResponseEntity<ResponseDTO<FollowDTO>> followAndUnfollow(
      @PathVariable Long followerId, @PathVariable Long followedId) {
    ResponseDTO<FollowDTO> result = followService.followAndUnfollow(followerId, followedId);
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
      @PathVariable Long followerId, @PathVariable Long followedId) {
    ResponseDTO<FollowDTO> result = followService.acceptFollowRequest(followerId, followedId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @PutMapping("/decline/{followerId}/{followedId}")
  public ResponseEntity<ResponseDTO<FollowDTO>> declineFollowRequest(
      @PathVariable Long followerId, @PathVariable Long followedId) {
    ResponseDTO<FollowDTO> result = followService.declineFollowRequest(followerId, followedId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }
}
