package com.weunite.api.common.mail.exception;

import com.weunite.api.common.exception.BaseException;

public class EmailSendingException extends BaseException {
  public EmailSendingException(String message, Throwable cause) {
    super(message, "EMAIL_SENDING_EXCEPTION", cause);
  }

  public EmailSendingException(String message) {
    super(message, "EMAIL_SENDING_EXCEPTION");
  }
}
