package com.example.weuniteauth.dto.comment;

import com.example.weuniteauth.validations.ValidComment;

@ValidComment
public record CommentRequestDTO(
        String text,
        String image
) {
}
