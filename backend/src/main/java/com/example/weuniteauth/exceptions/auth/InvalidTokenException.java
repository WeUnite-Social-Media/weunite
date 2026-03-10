package com.example.weuniteauth.exceptions.auth;

import com.example.weuniteauth.exceptions.BusinessRuleException;

public class InvalidTokenException extends BusinessRuleException {
    public InvalidTokenException() {
        super("Token inválido");
    }
}
