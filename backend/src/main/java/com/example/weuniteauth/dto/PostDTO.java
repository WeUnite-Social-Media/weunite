package com.example.weuniteauth.dto;

import java.time.Instant;
import java.util.List;

public record PostDTO(
        String id,
        String text,
        String imageUrl,
        List<LikeDTO> likes,
        List<CommentDTO> comments,
        Instant createdAt,
        Instant updatedAt,
        UserDTO user
) {

}
