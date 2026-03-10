package com.example.weuniteauth.dto;

public record FollowDTO(
    Long id,
    UserDTO follower,
    UserDTO followed,
    String status,
    String createdAt,
    String updatedAt
) {
}
