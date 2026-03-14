package com.weunite.api.common.exception;

public class BusinessRuleException extends BaseException {
  public BusinessRuleException(String message) {
    super(message, "BUSINESS_RULE_EXCEPTION");
  }
}
