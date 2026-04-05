package com.weunite.api.opportunities.exception;

import com.weunite.api.common.exception.NotFoundResourceException;

public class OpportunityNotFoundException extends NotFoundResourceException {
  public OpportunityNotFoundException() {
    super("Oportunidade não encontrada", true);
  }
}
