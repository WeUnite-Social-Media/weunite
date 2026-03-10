package com.example.weuniteauth.exceptions.user;

import com.example.weuniteauth.exceptions.DuplicateResourceException;

public class UserAlreadyExistsException extends DuplicateResourceException {
    public UserAlreadyExistsException() {
        super("Usuário já existe");
    }
}
