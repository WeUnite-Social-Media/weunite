package com.example.weuniteauth.exceptions;

public class UnauthorizedException extends BaseException {
    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED_EXCEPTION");
    }
}
