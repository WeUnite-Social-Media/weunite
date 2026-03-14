package com.weunite.api.opportunities.exception;

import com.weunite.api.common.exception.NotFoundResourceException;

public class SkillNotFoundException extends NotFoundResourceException {
  public SkillNotFoundException() {
    super("Está skill não foi encontrada");
  }
}
