package com.example.weuniteauth.validations;

import com.example.weuniteauth.dto.Opportunity.OpportunityRequestDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidOpportunityValidator implements ConstraintValidator<ValidOpportunity, OpportunityRequestDTO> {
    @Override
    public boolean isValid(OpportunityRequestDTO dto, ConstraintValidatorContext context) {
        return true;
    }
}
