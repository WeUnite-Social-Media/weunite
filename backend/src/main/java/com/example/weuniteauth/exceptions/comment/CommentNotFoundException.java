package com.example.weuniteauth.exceptions.comment;

import com.example.weuniteauth.exceptions.NotFoundResourceException;

public class CommentNotFoundException extends NotFoundResourceException {
    public CommentNotFoundException() {
        super("Comentário");
    }
}
