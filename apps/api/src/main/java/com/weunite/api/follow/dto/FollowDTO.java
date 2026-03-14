package com.weunite.api.follow.dto;

import com.weunite.api.users.dto.UserDTO;

public record FollowDTO(
    Long id,
    UserDTO follower,
    UserDTO followed,
    String status,
    String createdAt,
    String updatedAt) {}
