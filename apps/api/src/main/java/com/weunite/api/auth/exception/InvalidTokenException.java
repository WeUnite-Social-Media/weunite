package com.weunite.api.auth.exception;

import com.weunite.api.common.exception.BusinessRuleException;

public class InvalidTokenException extends BusinessRuleException {
  public InvalidTokenException() {
    super("Token inválido");
  }
}
