package com.weunite.api.posts.controller;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.posts.dto.LikeDTO;
import com.weunite.api.posts.service.LikeService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

  private final LikeService likeService;

  public LikeController(LikeService likeService) {
    this.likeService = likeService;
  }

  @PostMapping("/toggleLike/{userId}/{postId}")
  public ResponseEntity<ResponseDTO<LikeDTO>> toggleLike(
      @PathVariable Long userId, @PathVariable Long postId) {
    ResponseDTO<LikeDTO> result = likeService.toggleLike(userId, postId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @PostMapping("/toggleLikeComment/{userId}/{commentId}")
  public ResponseEntity<ResponseDTO<LikeDTO>> toggleLikeComment(
      @PathVariable Long userId, @PathVariable Long commentId) {
    ResponseDTO<LikeDTO> result = likeService.toggleLikeComment(userId, commentId);
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
