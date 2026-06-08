package com.weunite.api.posts.dto;

import java.util.List;

public record CommentPageDTO(
    List<CommentDTO> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean hasNext) {}
