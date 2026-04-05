package com.weunite.api.opportunities.exception;

import com.weunite.api.common.exception.BusinessRuleException;

public class OpportunityExpiredException extends BusinessRuleException {
  public OpportunityExpiredException() {
    super("O prazo desta oportunidade ja expirou");
  }
}
