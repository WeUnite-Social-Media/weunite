package com.example.weuniteauth.exceptions;

public class NotFoundResourceException extends BaseException {
    public NotFoundResourceException(String resource) {
        super(resource + " não encontrado", "RESOURCE_NOT_FOUND");
    }
}
