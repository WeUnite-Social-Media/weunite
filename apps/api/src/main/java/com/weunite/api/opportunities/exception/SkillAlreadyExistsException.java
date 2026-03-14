package com.weunite.api.opportunities.exception;

import com.weunite.api.common.exception.DuplicateResourceException;

public class SkillAlreadyExistsException extends DuplicateResourceException {
  public SkillAlreadyExistsException() {
    super("Skill já existe");
  }
}
