package com.example.weuniteauth.dto;

import java.time.Instant;

public record UserDTO(
        String id,
        String name,
        String username,
        String role,
        String bio,
        String email,
        String profileImg,
        String bannerImg,
        boolean isPrivate,
        Instant createdAt,
        Instant updatedAt
) {
}
