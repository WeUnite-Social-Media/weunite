package com.weunite.api.posts.dto;

import com.weunite.api.common.validation.ValidPost;

@ValidPost
public record PostRequestDTO(String text) {}
