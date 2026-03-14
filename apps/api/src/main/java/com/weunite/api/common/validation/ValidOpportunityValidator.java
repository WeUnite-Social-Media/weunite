package com.weunite.api.common.validation;

import com.weunite.api.opportunities.dto.OpportunityRequestDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidOpportunityValidator
    implements ConstraintValidator<ValidOpportunity, OpportunityRequestDTO> {
  @Override
  public boolean isValid(OpportunityRequestDTO dto, ConstraintValidatorContext context) {
    return true;
  }
}
