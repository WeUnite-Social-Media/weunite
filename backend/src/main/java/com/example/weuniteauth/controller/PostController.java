package com.example.weuniteauth.controller;

import com.example.weuniteauth.dto.PostDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.post.PostRequestDTO;
import com.example.weuniteauth.service.PostService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@Validated
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping(value = "/create/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseDTO<PostDTO>> createPost(@PathVariable Long userId,
                                                           @RequestPart("post") @Valid PostRequestDTO post,
                                                           @RequestPart(value = "image", required = false) MultipartFile image) {
        ResponseDTO<PostDTO> createdPost = postService.createPost(userId, post, image);
        return ResponseEntity.status(HttpStatus.OK).body(createdPost);
    }

    @PutMapping("/update/{userId}/{postId}")
    public ResponseEntity<ResponseDTO<PostDTO>> updatePost(@PathVariable Long userId,
                                                           @PathVariable Long postId,
                                                           @RequestPart("post") @Valid PostRequestDTO post,
                                                           @RequestPart(value = "image", required = false) MultipartFile image) {
        ResponseDTO<PostDTO> updatedPost = postService.updatePost(userId, postId, post, image);
        return ResponseEntity.status(HttpStatus.OK).body(updatedPost);
    }

    @GetMapping("/get/{postId}")
    public ResponseEntity<ResponseDTO<PostDTO>> getPost(@PathVariable Long postId) {
        ResponseDTO<PostDTO> post = postService.getPost(postId);
        return ResponseEntity.status(HttpStatus.OK).body(post);
    }

    @GetMapping("/get")
    public ResponseEntity<List<PostDTO>> getPosts() {
        List<PostDTO> posts = postService.getPosts();
        return ResponseEntity.status(HttpStatus.OK).body(posts);
    }

    @DeleteMapping("/delete/{userId}/{postId}")
    public ResponseEntity<ResponseDTO<PostDTO>> deletePost(@PathVariable Long userId, @PathVariable Long postId) {
        ResponseDTO<PostDTO> post = postService.deletePost(userId, postId);
        return ResponseEntity.status(HttpStatus.OK).body(post);
    }
}
