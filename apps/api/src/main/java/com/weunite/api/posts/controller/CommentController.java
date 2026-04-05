package com.weunite.api.posts.controller;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.posts.dto.CommentDTO;
import com.weunite.api.posts.dto.CommentRequestDTO;
import com.weunite.api.posts.service.CommentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/comment")
@Validated
public class CommentController {

  private final CommentService commentService;
  private final AuthenticatedUserService authenticatedUserService;

  public CommentController(
      CommentService commentService, AuthenticatedUserService authenticatedUserService) {
    this.commentService = commentService;
    this.authenticatedUserService = authenticatedUserService;
  }

  @PostMapping("/create")
  public ResponseEntity<ResponseDTO<CommentDTO>> createComment(
      @AuthenticationPrincipal Jwt jwt,
      @RequestParam Long userId,
      @RequestParam Long postId,
      @Valid @RequestBody CommentRequestDTO commentRequestDTO) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    ResponseDTO<CommentDTO> commentDTO =
        commentService.createComment(authenticatedUserId, postId, commentRequestDTO);
    return ResponseEntity.status(HttpStatus.OK).body(commentDTO);
  }

  @GetMapping("/get/{postId}")
  public ResponseEntity<List<CommentDTO>> getCommentsByPost(@PathVariable Long postId) {
    List<CommentDTO> comments = commentService.getCommentsByPost(postId);
    return ResponseEntity.status(HttpStatus.OK).body(comments);
  }

  @GetMapping("/get/user/{userId}")
  public ResponseEntity<List<CommentDTO>> getCommentsByUser(@PathVariable Long userId) {
    List<CommentDTO> comments = commentService.getCommentsByUser(userId);
    return ResponseEntity.status(HttpStatus.OK).body(comments);
  }

  @PutMapping("/update/{userId}/{commentId}")
  public ResponseEntity<ResponseDTO<CommentDTO>> updatePost(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long userId,
      @PathVariable Long commentId,
      @RequestPart("comment") @Valid CommentRequestDTO comment,
      @RequestPart(value = "image", required = false) MultipartFile image) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    ResponseDTO<CommentDTO> updatedComment =
        commentService.updateComment(authenticatedUserId, commentId, comment, image);
    return ResponseEntity.status(HttpStatus.OK).body(updatedComment);
  }

  @DeleteMapping("/delete/{userId}/{commentId}")
  public ResponseEntity<ResponseDTO<CommentDTO>> deleteComment(
      @AuthenticationPrincipal Jwt jwt, @PathVariable Long userId, @PathVariable Long commentId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    ResponseDTO<CommentDTO> post = commentService.deleteComment(authenticatedUserId, commentId);
    return ResponseEntity.status(HttpStatus.OK).body(post);
  }
}
