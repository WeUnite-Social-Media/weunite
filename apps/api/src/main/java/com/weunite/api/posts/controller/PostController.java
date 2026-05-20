package com.weunite.api.posts.controller;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.AuthenticatedUserService;
import com.weunite.api.posts.dto.PostDTO;
import com.weunite.api.posts.dto.PostRequestDTO;
import com.weunite.api.posts.dto.RepostDTO;
import com.weunite.api.posts.service.PostService;
import com.weunite.api.posts.service.RepostService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/posts")
@Validated
public class PostController {

  private final PostService postService;
  private final RepostService repostService;
  private final AuthenticatedUserService authenticatedUserService;

  public PostController(
      PostService postService,
      RepostService repostService,
      AuthenticatedUserService authenticatedUserService) {
    this.postService = postService;
    this.repostService = repostService;
    this.authenticatedUserService = authenticatedUserService;
  }

  @PostMapping(value = "/create/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ResponseDTO<PostDTO>> createPost(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long userId,
      @RequestPart("post") @Valid PostRequestDTO post,
      @RequestPart(value = "image", required = false) MultipartFile image) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    ResponseDTO<PostDTO> createdPost = postService.createPost(authenticatedUserId, post, image);
    return ResponseEntity.status(HttpStatus.OK).body(createdPost);
  }

  @PutMapping("/update/{userId}/{postId}")
  public ResponseEntity<ResponseDTO<PostDTO>> updatePost(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable Long userId,
      @PathVariable Long postId,
      @RequestPart("post") @Valid PostRequestDTO post,
      @RequestPart(value = "image", required = false) MultipartFile image) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    ResponseDTO<PostDTO> updatedPost =
        postService.updatePost(authenticatedUserId, postId, post, image);
    return ResponseEntity.status(HttpStatus.OK).body(updatedPost);
  }

  @GetMapping("/get/{postId}")
  public ResponseEntity<ResponseDTO<PostDTO>> getPost(@PathVariable Long postId) {
    ResponseDTO<PostDTO> post = postService.getPost(postId);
    return ResponseEntity.status(HttpStatus.OK).body(post);
  }

  @GetMapping("/get")
  public ResponseEntity<List<PostDTO>> getPosts(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
    List<PostDTO> posts = postService.getPosts(page, size);
    return ResponseEntity.status(HttpStatus.OK).body(posts);
  }

  @GetMapping("/get/user/{userId}")
  public ResponseEntity<List<PostDTO>> getPostsByUser(
      @PathVariable Long userId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "50") int size) {
    List<PostDTO> posts = postService.getPostsByUser(userId, page, size);
    return ResponseEntity.status(HttpStatus.OK).body(posts);
  }

  @DeleteMapping("/delete/{userId}/{postId}")
  public ResponseEntity<ResponseDTO<PostDTO>> deletePost(
      @AuthenticationPrincipal Jwt jwt, @PathVariable Long userId, @PathVariable Long postId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    ResponseDTO<PostDTO> post = postService.deletePost(authenticatedUserId, postId);
    return ResponseEntity.status(HttpStatus.OK).body(post);
  }

  @PostMapping("/repost/{userId}/{postId}")
  public ResponseEntity<ResponseDTO<RepostDTO>> toggleRepost(
      @AuthenticationPrincipal Jwt jwt, @PathVariable Long userId, @PathVariable Long postId) {
    Long authenticatedUserId = authenticatedUserService.requireMatchingUserId(jwt, userId);
    ResponseDTO<RepostDTO> repost = repostService.toggleRepost(authenticatedUserId, postId);
    return ResponseEntity.status(HttpStatus.OK).body(repost);
  }
}
