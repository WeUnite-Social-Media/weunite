package com.weunite.api.posts.controller;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.posts.dto.LikeDTO;
import com.weunite.api.posts.service.LikeService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

  private final LikeService likeService;
  private final AuthenticatedUserService authenticatedUserService;

  public LikeController(
      LikeService likeService, AuthenticatedUserService authenticatedUserService) {
    this.likeService = likeService;
    this.authenticatedUserService = authenticatedUserService;
  }

  @PostMapping("/toggleLike/{userId}/{postId}")
  public ResponseEntity<ResponseDTO<LikeDTO>> toggleLike(
      @AuthenticationPrincipal Jwt jwt, @PathVariable Long userId, @PathVariable Long postId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    ResponseDTO<LikeDTO> result = likeService.toggleLike(authenticatedUserId, postId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @PostMapping("/toggleLikeComment/{userId}/{commentId}")
  public ResponseEntity<ResponseDTO<LikeDTO>> toggleLikeComment(
      @AuthenticationPrincipal Jwt jwt, @PathVariable Long userId, @PathVariable Long commentId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    ResponseDTO<LikeDTO> result = likeService.toggleLikeComment(authenticatedUserId, commentId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/comments/{commentId}")
  public ResponseEntity<ResponseDTO<List<LikeDTO>>> getCommentLikes(@PathVariable Long commentId) {
    ResponseDTO<List<LikeDTO>> result = likeService.getCommentLikes(commentId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/get/{userId}")
  public ResponseEntity<ResponseDTO<List<LikeDTO>>> getLikes(@PathVariable Long userId) {
    ResponseDTO<List<LikeDTO>> result = likeService.getLikes(userId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @GetMapping("/get/{userId}/page")
  public ResponseEntity<ResponseDTO<List<LikeDTO>>> getLikes(
      @PathVariable Long userId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    ResponseDTO<List<LikeDTO>> result = likeService.getLikes(userId, page, size);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }
}
