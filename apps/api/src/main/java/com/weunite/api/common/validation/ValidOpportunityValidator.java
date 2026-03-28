package com.weunite.api.common.validation;

import com.weunite.api.opportunities.dto.OpportunityRequestDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;

public class ValidOpportunityValidator
    implements ConstraintValidator<ValidOpportunity, OpportunityRequestDTO> {
  @Override
  public boolean isValid(OpportunityRequestDTO dto, ConstraintValidatorContext context) {
    if (dto == null) {
      return true;
    }

    boolean valid = true;
    context.disableDefaultConstraintViolation();

    if (dto.title() == null || dto.title().isBlank()) {
      addViolation(context, "title", "O título é obrigatório");
      valid = false;
    } else if (dto.title().length() < 3 || dto.title().length() > 120) {
      addViolation(context, "title", "O título deve ter entre 3 e 120 caracteres");
      valid = false;
    }

    if (dto.description() == null || dto.description().isBlank()) {
      addViolation(context, "description", "A descrição é obrigatória");
      valid = false;
    } else if (dto.description().length() < 10 || dto.description().length() > 500) {
      addViolation(
          context, "description", "A descrição deve ter entre 10 e 500 caracteres");
      valid = false;
    }

    if (dto.location() == null || dto.location().isBlank()) {
      addViolation(context, "location", "A localização é obrigatória");
      valid = false;
    }

    if (dto.dateEnd() == null) {
      addViolation(context, "dateEnd", "A data de término é obrigatória");
      valid = false;
    } else if (dto.dateEnd().isBefore(LocalDate.now())) {
      addViolation(context, "dateEnd", "A data de término não pode estar no passado");
      valid = false;
    }

    if (dto.skills() == null || dto.skills().isEmpty()) {
      addViolation(context, "skills", "Selecione pelo menos uma habilidade");
      valid = false;
    } else if (dto.skills().stream()
        .anyMatch(skill -> skill == null || skill.getName() == null || skill.getName().isBlank())) {
      addViolation(context, "skills", "As habilidades precisam ter nomes válidos");
      valid = false;
    }

    return valid;
  }

  private void addViolation(ConstraintValidatorContext context, String field, String message) {
    context
        .buildConstraintViolationWithTemplate(message)
        .addPropertyNode(field)
        .addConstraintViolation();
  }
}
