package com.example.weuniteauth.controller;

import com.example.weuniteauth.dto.CommentDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.comment.CommentRequestDTO;
import com.example.weuniteauth.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/comment")
@Validated
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseDTO<CommentDTO>> createComment(
            @RequestParam Long userId,
            @RequestParam Long postId,
            @Valid @RequestBody CommentRequestDTO commentRequestDTO) {
        ResponseDTO<CommentDTO> commentDTO = commentService.createComment(userId, postId, commentRequestDTO);
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
    public ResponseEntity<ResponseDTO<CommentDTO>> updatePost(@PathVariable Long userId,
                                                              @PathVariable Long commentId,
                                                              @RequestPart("comment") @Valid CommentRequestDTO comment,
                                                              @RequestPart(value = "image", required = false) MultipartFile image) {
        ResponseDTO<CommentDTO> updatedComment = commentService.updateComment(userId, commentId, comment, image);
        return ResponseEntity.status(HttpStatus.OK).body(updatedComment);
    }

    @DeleteMapping("/delete/{userId}/{commentId}")
    public ResponseEntity<ResponseDTO<CommentDTO>> deleteComment(@PathVariable Long userId, @PathVariable Long commentId) {
        ResponseDTO<CommentDTO> post = commentService.deleteComment(userId, commentId);
        return ResponseEntity.status(HttpStatus.OK).body(post);
    }
}
