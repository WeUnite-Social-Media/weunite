package com.example.weuniteauth.exceptions.auth;

import com.example.weuniteauth.exceptions.BusinessRuleException;

public class ExpiredTokenException extends BusinessRuleException {
    public ExpiredTokenException() {
        super("Token expirado");
    }
}
