package com.example.weuniteauth.exceptions.mail;

import com.example.weuniteauth.exceptions.BaseException;

public class EmailSendingException extends BaseException {
    public EmailSendingException(String message, Throwable cause) {
        super(message, "EMAIL_SENDING_EXCEPTION", cause);
    }

    public EmailSendingException(String message) {
        super(message, "EMAIL_SENDING_EXCEPTION");
    }
}
