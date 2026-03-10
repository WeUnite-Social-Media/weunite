package com.example.weuniteauth.response;

import lombok.Getter;
import java.time.Instant;

@Getter
public class ErrorResponse {
    private String message;
    private String error;
    private Instant timestamp;

    public ErrorResponse(String message, String error) {
        this.message = message;
        this.error = error;
        this.timestamp = Instant.now();
    }
}
