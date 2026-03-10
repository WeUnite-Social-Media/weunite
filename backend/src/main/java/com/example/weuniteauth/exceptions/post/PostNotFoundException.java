package com.example.weuniteauth.exceptions.post;

import com.example.weuniteauth.exceptions.NotFoundResourceException;

public class PostNotFoundException extends NotFoundResourceException {
    public PostNotFoundException() {
        super("Publicação");
    }
}
