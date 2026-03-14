package com.weunite.api.common.mail.exception;

import com.weunite.api.common.exception.BaseException;

public class LoadingEmailTemplateException extends BaseException {
  public LoadingEmailTemplateException(String message, Throwable cause) {
    super(message, "LOADING_EMAIL_TEMPLATE_EXCEPTION", cause);
  }
}
