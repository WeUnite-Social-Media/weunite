package com.example.weuniteauth.dto;

import java.time.Instant;
import java.util.List;

public record CommentDTO(

        String id,

        UserDTO user,

        PostDTO post,

        String text,

        String imageUrl,

        CommentDTO parentComment,

        List<CommentDTO> comments,

        Instant createdAt,

        Instant updatedAt

) {
}
