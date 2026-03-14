package com.weunite.api.auth.exception;

import com.weunite.api.common.exception.BusinessRuleException;

public class NotVerifiedEmailException extends BusinessRuleException {
  public NotVerifiedEmailException(String message) {
    super(message);
  }
}
