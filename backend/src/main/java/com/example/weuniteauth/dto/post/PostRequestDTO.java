package com.example.weuniteauth.dto.post;

import com.example.weuniteauth.validations.ValidPost;

@ValidPost
public record PostRequestDTO(
        String text
) {
}
