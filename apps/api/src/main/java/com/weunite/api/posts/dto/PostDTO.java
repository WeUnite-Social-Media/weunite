package com.weunite.api.posts.dto;

import com.weunite.api.users.dto.UserDTO;
import java.time.Instant;
import java.util.List;

public record PostDTO(
    String id,
    String text,
    String imageUrl,
    List<LikeDTO> likes,
    List<CommentDTO> comments,
    List<RepostDTO> reposts,
    Instant createdAt,
    Instant updatedAt,
    UserDTO user,
    UserDTO repostedBy,
    Instant repostedAt) {}
