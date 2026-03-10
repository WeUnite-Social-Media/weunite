package com.example.weuniteauth.exceptions.mail;

import com.example.weuniteauth.exceptions.BaseException;

public class LoadingEmailTemplateException extends BaseException {
    public LoadingEmailTemplateException(String message, Throwable cause) {
        super(message, "LOADING_EMAIL_TEMPLATE_EXCEPTION", cause);
    }
}
