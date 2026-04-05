package com.weunite.api.posts.dto;

import com.weunite.api.common.validation.ValidComment;

@ValidComment
public record CommentRequestDTO(String text, String image) {}
