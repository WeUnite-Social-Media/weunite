package com.weunite.api.common.exception;

public class UnauthorizedException extends BaseException {
  public UnauthorizedException(String message) {
    super(message, "UNAUTHORIZED_EXCEPTION");
  }
}
