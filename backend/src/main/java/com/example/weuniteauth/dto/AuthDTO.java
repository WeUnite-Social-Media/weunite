package com.example.weuniteauth.dto;

public record AuthDTO(
        UserDTO user,
        String jwt,
        Long expiresIn
) { }
