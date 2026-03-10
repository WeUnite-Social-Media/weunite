package com.example.weuniteauth.exceptions;

public class DuplicateResourceException extends BaseException{
    public DuplicateResourceException(String message) {
        super(message, "DUPLICATE_RESOURCE_EXCEPTION");
    }
}
