package com.example.weuniteauth.exceptions;

public class BusinessRuleException extends BaseException{
    public BusinessRuleException(String message) {
        super(message, "BUSINESS_RULE_EXCEPTION");
    }
}
