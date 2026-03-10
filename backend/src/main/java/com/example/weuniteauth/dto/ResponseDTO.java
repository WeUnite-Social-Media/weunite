package com.example.weuniteauth.dto;

public record ResponseDTO<T>(
        String message,
        T data
) {
}
