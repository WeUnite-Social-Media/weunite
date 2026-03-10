package com.example.weuniteauth.exceptions.auth;

import com.example.weuniteauth.exceptions.BusinessRuleException;

public class NotVerifiedEmailException extends BusinessRuleException {
    public NotVerifiedEmailException(String message) {
        super(message);
    }
}
