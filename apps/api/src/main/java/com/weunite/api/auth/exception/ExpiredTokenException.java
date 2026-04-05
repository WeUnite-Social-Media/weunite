package com.weunite.api.auth.exception;

import com.weunite.api.common.exception.BusinessRuleException;

public class ExpiredTokenException extends BusinessRuleException {
  public ExpiredTokenException() {
    super("Token expirado");
  }
}
