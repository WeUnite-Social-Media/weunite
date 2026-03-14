package com.weunite.api.posts.dto;

import com.weunite.api.users.dto.UserDTO;

public record LikeDTO(String id, UserDTO user, PostDTO post) {}
