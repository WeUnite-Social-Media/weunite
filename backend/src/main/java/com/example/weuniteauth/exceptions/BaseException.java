package com.example.weuniteauth.exceptions;

import lombok.Getter;

@Getter
public class BaseException extends RuntimeException {
    private final String error;

    public BaseException(String message, String error) {
        super(message);
        this.error = error;
    }

    public BaseException(String message, String error, Throwable cause) {
        super(message, cause);
        this.error = error;
    }
}
